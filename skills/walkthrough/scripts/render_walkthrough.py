#!/usr/bin/env python3
"""Render an interactive walkthrough page from a walkthrough.json file.

Usage:
    python3 render_walkthrough.py walkthrough.json --simulator simulator.html --out walkthrough.html
    python3 render_walkthrough.py walkthrough.json --prose

--prose prints every piece of text the reader will see, as plain text with its JSON path, so the
wording can be reviewed in one pass before rendering.

The page layout, styles and behavior live in ../assets/walkthrough-template.html. This script
validates the walkthrough content, fills the template's walkthrough:* slots, renders the diff
hunks, and places the changeset's simulator. The JSON format is described in
../references/walkthrough-json.md.

Errors start with "walkthrough-render:" and name the JSON path that is wrong. Every problem
is reported at once, and nothing is written while any remain.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
from pathlib import Path

TEMPLATE_PATH = Path(__file__).resolve().parent.parent / "assets" / "walkthrough-template.html"
ERROR_PREFIX = "walkthrough-render:"

# Chapter anchors the template uses; a change section id must not reuse them.
CHAPTER_IDS = ("orientation", "problem", "solution", "intuition", "map", "changes", "faq", "quiz")
CHAPTER_TITLES = ("Orientation", "Problem", "Solution", "Core intuition", "Map", "Changes", "FAQ", "Quiz")
# Anchors that a page host may use for its own panels, so a section id must not take them.
RESERVED_IDS = ("settings", "sidebar", "customize", "upgrade", "downloads")
SECTION_ID = re.compile(r"^[a-z][a-z0-9-]*$")
# Inline formatting that a plain-text field would show as literal text.
FORMATTING_TAG = re.compile(r"<\s*/?\s*(code|strong|em|b|i|a|br|span|kbd|sup|sub)\b", re.IGNORECASE)
# A "Look closer" heading written into an overview instead of the look_closer list.
LOOK_CLOSER_IN_OVERVIEW = re.compile(r">\s*Look closer\b", re.IGNORECASE)
FILE_BADGES = ("new", "deleted")
CALLOUT_KINDS = ("warning", "important")
TRADEOFF_KINDS = ("deliberate", "implicit")
BAND_STYLES = ("edge", "removed")
MAX_QUIZ_QUESTIONS = 10
QUIZ_OPTIONS = 4

DOWN_ARROW_SVG = (
    '<svg width="12" height="28" viewBox="0 0 12 28" aria-hidden="true">'
    '<path d="M6 1v23" stroke="currentColor" stroke-width="1.5"/>'
    '<path d="M1.8 20.5 6 26.5l4.2-6" fill="none" stroke="currentColor" stroke-width="1.5" '
    'stroke-linecap="round" stroke-linejoin="round"/></svg>'
)


class WalkthroughError(Exception):
    """Raised with every validation problem found in a walkthrough.json file."""

    def __init__(self, problems: list[str]):
        super().__init__("\n".join(f"{ERROR_PREFIX} {problem}" for problem in problems))
        self.problems = problems


# ---------- Validation ----------

class _Checker:
    def __init__(self) -> None:
        self.problems: list[str] = []

    def fail(self, path: str, message: str) -> None:
        self.problems.append(f"{path}: {message}")

    def text(self, value, path: str, required: bool = True, plain: bool = True) -> bool:
        if value is None and not required:
            return True
        if not isinstance(value, str) or (required and not value.strip()):
            self.fail(path, "must be a non-empty string")
            return False
        if plain and FORMATTING_TAG.search(value):
            self.fail(path, "must be plain text; HTML tags such as <code> show as literal text here, so write the bare name")
            return False
        return True

    def markup(self, value, path: str, required: bool = True) -> None:
        """HTML fragments are inserted as written, so they must not carry their own scripts."""
        if self.text(value, path, required, plain=False) and value and re.search(r"<\s*script", value, re.IGNORECASE):
            self.fail(path, "must not contain <script>; put simulator code in the simulator file")

    def items(self, value, path: str, required: bool = True) -> list:
        if value is None and not required:
            return []
        if not isinstance(value, list) or (required and not value):
            self.fail(path, "must be a non-empty list")
            return []
        return value

    def one_of(self, value, choices: tuple, path: str) -> None:
        if value not in choices:
            self.fail(path, f"must be one of {', '.join(choices)}")


def validate_walkthrough(data) -> None:
    """Raises WalkthroughError listing every problem in the walkthrough content."""
    check = _Checker()
    if not isinstance(data, dict):
        raise WalkthroughError(["$: the top level must be a JSON object"])

    check.text(data.get("title"), "title")
    check.text(data.get("rail_title"), "rail_title")
    for key in ("lede", "orientation", "problem", "solution", "changes_intro"):
        check.markup(data.get(key), key)
    if not isinstance(data.get("intuition"), dict):
        check.fail("intuition", "must be an object with an intro")
    else:
        check.markup(data["intuition"].get("intro"), "intuition.intro")

    section_ids: list[str] = []
    for i, section in enumerate(check.items(data.get("sections"), "sections")):
        path = f"sections[{i}]"
        if not isinstance(section, dict):
            check.fail(path, "must be an object")
            continue
        section_id = section.get("id")
        if not isinstance(section_id, str) or not SECTION_ID.match(section_id):
            check.fail(f"{path}.id", "must be lowercase letters, digits and hyphens, starting with a letter")
        elif section_id in CHAPTER_IDS or section_id in RESERVED_IDS or section_id.startswith("comment-"):
            check.fail(f"{path}.id", f"\"{section_id}\" is reserved; choose another id")
        elif section_id in section_ids:
            check.fail(f"{path}.id", f"\"{section_id}\" is used by an earlier section")
        else:
            section_ids.append(section_id)
        check.text(section.get("nav"), f"{path}.nav")
        check.text(section.get("title"), f"{path}.title")
        check.markup(section.get("overview"), f"{path}.overview")
        if isinstance(section.get("overview"), str) and LOOK_CLOSER_IN_OVERVIEW.search(section["overview"]):
            check.fail(f"{path}.overview", "has a Look closer list; move its items to look_closer, which the page shows as a box")
        for j, callout in enumerate(check.items(section.get("callouts"), f"{path}.callouts", required=False)):
            cpath = f"{path}.callouts[{j}]"
            if not isinstance(callout, dict):
                check.fail(cpath, "must be an object")
                continue
            check.one_of(callout.get("kind"), CALLOUT_KINDS, f"{cpath}.kind")
            check.text(callout.get("label"), f"{cpath}.label")
            check.markup(callout.get("text"), f"{cpath}.text")
        for j, item in enumerate(check.items(section.get("look_closer"), f"{path}.look_closer", required=False)):
            check.markup(item, f"{path}.look_closer[{j}]")
        for j, changed_file in enumerate(check.items(section.get("files"), f"{path}.files")):
            fpath = f"{path}.files[{j}]"
            if not isinstance(changed_file, dict):
                check.fail(fpath, "must be an object")
                continue
            check.text(changed_file.get("path"), f"{fpath}.path")
            check.markup(changed_file.get("summary"), f"{fpath}.summary")
            if changed_file.get("badge") is not None:
                check.one_of(changed_file.get("badge"), FILE_BADGES, f"{fpath}.badge")
            check.text(changed_file.get("hunk"), f"{fpath}.hunk", required=False, plain=False)

    known_sections = set(section_ids)

    def section_link(value, path: str, required: bool = True) -> None:
        if value is None and not required:
            return
        if value not in known_sections:
            check.fail(path, f"must be the id of a section, got {json.dumps(value)}")

    for i, group in enumerate(check.items(data.get("decisions"), "decisions")):
        gpath = f"decisions[{i}]"
        if not isinstance(group, dict):
            check.fail(gpath, "must be an object")
            continue
        check.text(group.get("group"), f"{gpath}.group")
        for j, decision in enumerate(check.items(group.get("items"), f"{gpath}.items")):
            dpath = f"{gpath}.items[{j}]"
            if not isinstance(decision, dict):
                check.fail(dpath, "must be an object")
                continue
            check.text(decision.get("choice"), f"{dpath}.choice")
            check.markup(decision.get("instead"), f"{dpath}.instead")
            check.markup(decision.get("why"), f"{dpath}.why")
            section_link(decision.get("section"), f"{dpath}.section", required=False)

    for i, tradeoff in enumerate(check.items(data.get("tradeoffs"), "tradeoffs")):
        tpath = f"tradeoffs[{i}]"
        if not isinstance(tradeoff, dict):
            check.fail(tpath, "must be an object")
            continue
        check.text(tradeoff.get("name"), f"{tpath}.name")
        check.one_of(tradeoff.get("kind"), TRADEOFF_KINDS, f"{tpath}.kind")
        check.markup(tradeoff.get("text"), f"{tpath}.text")

    linked_sections: set[str] = set()
    for i, row in enumerate(check.items(data.get("map"), "map")):
        rpath = f"map[{i}]"
        if not isinstance(row, dict):
            check.fail(rpath, "must be an object")
            continue
        kind = row.get("type")
        if kind == "band":
            check.text(row.get("label"), f"{rpath}.label")
            for j, item in enumerate(check.items(row.get("items"), f"{rpath}.items")):
                check.markup(item, f"{rpath}.items[{j}]")
            if row.get("style") is not None:
                check.one_of(row.get("style"), BAND_STYLES, f"{rpath}.style")
            section_link(row.get("section"), f"{rpath}.section", required=False)
            if row.get("section"):
                linked_sections.add(row["section"])
        elif kind == "arrow":
            check.text(row.get("label"), f"{rpath}.label", required=False)
        elif kind == "nodes":
            for j, node in enumerate(check.items(row.get("nodes"), f"{rpath}.nodes")):
                npath = f"{rpath}.nodes[{j}]"
                if not isinstance(node, dict):
                    check.fail(npath, "must be an object")
                    continue
                node_section = node.get("section")
                section_link(node_section, f"{npath}.section")
                if isinstance(node_section, str):
                    if node_section in linked_sections:
                        check.fail(f"{npath}.section", f"\"{node_section}\" already has a map box; use one box per section")
                    linked_sections.add(node_section)
                check.text(node.get("title"), f"{npath}.title")
                check.markup(node.get("text"), f"{npath}.text")
        else:
            check.fail(f"{rpath}.type", "must be one of band, arrow, nodes")

    for i, entry in enumerate(check.items(data.get("faq"), "faq")):
        qpath = f"faq[{i}]"
        if not isinstance(entry, dict):
            check.fail(qpath, "must be an object")
            continue
        check.text(entry.get("question"), f"{qpath}.question")
        check.markup(entry.get("answer"), f"{qpath}.answer")

    quiz = check.items(data.get("quiz"), "quiz")
    if len(quiz) > MAX_QUIZ_QUESTIONS:
        check.fail("quiz", f"has {len(quiz)} questions; the limit is {MAX_QUIZ_QUESTIONS}")
    correct_positions = []
    for i, question in enumerate(quiz):
        qpath = f"quiz[{i}]"
        if not isinstance(question, dict):
            check.fail(qpath, "must be an object")
            continue
        for key in ("topic", "question", "why"):
            check.text(question.get(key), f"{qpath}.{key}")
        options = check.items(question.get("options"), f"{qpath}.options")
        if options and len(options) != QUIZ_OPTIONS:
            check.fail(f"{qpath}.options", f"must have {QUIZ_OPTIONS} options: the right answer and three wrong ones")
        for j, option in enumerate(options):
            check.text(option, f"{qpath}.options[{j}]")
        correct = question.get("correct")
        if not isinstance(correct, int) or isinstance(correct, bool) or not 0 <= correct < max(len(options), 1):
            check.fail(f"{qpath}.correct", "must be the index of the right option")
        else:
            correct_positions.append(correct)
    if len(correct_positions) >= 3 and len(set(correct_positions)) == 1:
        check.fail("quiz", "every right answer is in the same position; vary it between questions")

    if check.problems:
        raise WalkthroughError(check.problems)


# ---------- Rendering ----------

def esc(text: str) -> str:
    return html.escape(text, quote=True)


def render_hunk(hunk: str) -> str:
    """Renders simplified diff text: '+' added, '-' removed, '…' a cut, anything else context."""
    lines = hunk.strip("\n").split("\n")
    spans = []
    for line in lines:
        if line.startswith("+"):
            kind = "a"
        elif line.startswith("-"):
            kind = "r"
        elif line.lstrip().startswith("…"):
            kind = "g"
        else:
            kind = "c"
        spans.append(f'<span class="{kind}">{esc(line) or " "}</span>')
    return f'<pre class="diff">{"".join(spans)}</pre>'


def render_file_path(path: str, badge: str | None) -> str:
    folder, _, name = path.rpartition("/")
    folder_html = f'<span class="dir">{esc(folder)}/</span>' if folder else ""
    badge_html = f'<span class="badge {"new" if badge == "new" else "del"}">{badge}</span>' if badge else ""
    return f'<span class="path">{folder_html}<span class="file-name">{esc(name)}</span>{badge_html}</span>'


def render_file(changed_file: dict) -> str:
    head = render_file_path(changed_file["path"], changed_file.get("badge"))
    summary = f'<span class="sum">{changed_file["summary"]}</span>'
    if changed_file.get("hunk"):
        return f'<details class="file" open><summary>{head}{summary}</summary>{render_hunk(changed_file["hunk"])}</details>'
    return f'<div class="file nohunk"><div class="file-head">{head}{summary}</div></div>'


def section_numbers(sections: list[dict]) -> dict[str, str]:
    return {section["id"]: f"6.{i}" for i, section in enumerate(sections, start=1)}


def render_rail(data: dict, numbers: dict[str, str]) -> str:
    sub_items = "".join(
        f'        <li><a href="#{section["id"]}"><span class="n">{numbers[section["id"]]}</span><span>{esc(section["nav"])}</span></a></li>\n'
        for section in data["sections"]
    )
    lines = []
    for n, (chapter_id, chapter_title) in enumerate(zip(CHAPTER_IDS, CHAPTER_TITLES), start=1):
        link = f'<a href="#{chapter_id}"><span class="n">{n}</span><span>{chapter_title}</span></a>'
        if chapter_id == "changes":
            lines.append(f"    <li>{link}\n      <ol>\n{sub_items}      </ol>\n    </li>")
        else:
            lines.append(f"    <li>{link}</li>")
    return "\n".join(lines)


def render_chapter(chapter_id: str, body: str) -> str:
    n = CHAPTER_IDS.index(chapter_id) + 1
    title = CHAPTER_TITLES[n - 1]
    return f'<section class="chapter" id="{chapter_id}">\n  <h2><span class="n">{n}</span>{title}</h2>\n{body}\n</section>\n'


def render_decisions(groups: list[dict], numbers: dict[str, str]) -> str:
    parts = ['  <h3>Key decisions</h3>\n  <div class="decisions">']
    def where(decision: dict) -> str:
        section = decision.get("section")
        return f'<dd class="where"><a href="#{section}">See {numbers[section]}</a></dd>' if section else ""

    for group in groups:
        rows = "".join(
            f'        <div class="decision"><dt>{esc(d["choice"])}<span class="instead">{d["instead"]}</span></dt>'
            f'<dd class="why">{d["why"]}</dd>{where(d)}</div>\n'
            for d in group["items"]
        )
        parts.append(f'    <div class="decision-group">\n      <h4>{esc(group["group"])}</h4>\n      <dl>\n{rows}      </dl>\n    </div>')
    parts.append("  </div>")
    return "\n".join(parts)


def render_tradeoffs(tradeoffs: list[dict]) -> str:
    rows = "".join(
        f'      <tr><td><strong>{esc(t["name"])}</strong></td>'
        f'<td><span class="kind {t["kind"]}">{t["kind"].capitalize()}</span></td><td>{t["text"]}</td></tr>\n'
        for t in tradeoffs
    )
    return (
        '  <h3>Tradeoffs</h3>\n  <div class="table-wrap"><table>\n'
        "    <thead><tr><th>Tradeoff</th><th>Kind</th><th>What it means</th></tr></thead>\n"
        f"    <tbody>\n{rows}    </tbody>\n  </table></div>"
    )


def render_map(rows: list[dict], numbers: dict[str, str]) -> str:
    parts = ['  <p>Click a box to jump to its section of the changes.</p>', '  <div class="map">']
    previous_type = None
    for row in rows:
        kind = row["type"]
        # Bands and box rows touch unless an arrow joins them, so separate them with a gap.
        if kind == "band" and previous_type in ("band", "nodes"):
            parts.append('    <div class="gap"></div>')
        if kind == "band":
            classes = "band" + (f' {row["style"]}' if row.get("style") else "")
            items = "".join(f"<span>{item}</span>" for item in row["items"])
            if row.get("section"):
                label = f'{esc(row["label"])} · {numbers[row["section"]]}'
                parts.append(f'    <a class="{classes}" href="#{row["section"]}"><span class="k">{label}</span>{items}</a>')
            else:
                parts.append(f'    <div class="{classes}"><span class="k">{esc(row["label"])}</span>{items}</div>')
        elif kind == "arrow":
            label = f'<span>{esc(row["label"])}</span>' if row.get("label") else ""
            parts.append(f'    <div class="down">{DOWN_ARROW_SVG}{label}</div>')
        else:
            nodes = row["nodes"]
            container = "node-pair" if len(nodes) == 2 else "node-grid"
            boxes = "".join(
                f'<a class="node{" emphasis" if node.get("emphasis") else ""}" href="#{node["section"]}">'
                f'<span class="s">{numbers[node["section"]]}</span><span class="t">{esc(node["title"])}</span>'
                f'<span class="d">{node["text"]}</span></a>'
                for node in nodes
            )
            parts.append(f'    <div class="{container}">{boxes}</div>')
        previous_type = kind
    parts.append("  </div>")
    return "\n".join(parts)


def render_section(section: dict, number: str) -> str:
    parts = [
        f'  <article class="change" id="{section["id"]}">',
        f'    <h3><span class="num">{number}</span>{esc(section["title"])}</h3>',
        f'    {section["overview"]}',
    ]
    for callout in section.get("callouts") or []:
        kind_class = "callout important" if callout["kind"] == "important" else "callout"
        parts.append(f'    <div class="{kind_class}"><p><span class="tag">{esc(callout["label"])}.</span> {callout["text"]}</p></div>')
    if section.get("look_closer"):
        items = "".join(f"<li>{item}</li>" for item in section["look_closer"])
        parts.append(f'    <div class="look"><strong class="h">Look closer</strong><ul>{items}</ul></div>')
    files = "\n".join(f"      {render_file(f)}" for f in section["files"])
    parts.append(f'    <div class="files">\n{files}\n    </div>')
    parts.append("  </article>")
    return "\n".join(parts)


def split_simulator(fragment: str) -> tuple[str, str]:
    """Splits a simulator fragment into its markup and its <script> blocks."""
    scripts = re.findall(r"<script\b[^>]*>.*?</script>", fragment, flags=re.DOTALL | re.IGNORECASE)
    markup = re.sub(r"<script\b[^>]*>.*?</script>", "", fragment, flags=re.DOTALL | re.IGNORECASE).strip()
    return markup, "\n".join(scripts)


def render_main(data: dict, simulator_markup: str) -> str:
    numbers = section_numbers(data["sections"])
    intuition = [f'  {data["intuition"]["intro"]}']
    if simulator_markup:
        intuition.append(simulator_markup)
    intuition.append(render_decisions(data["decisions"], numbers))
    intuition.append(render_tradeoffs(data["tradeoffs"]))
    changes = [
        '  <div class="changes-intro">',
        f'    {data["changes_intro"]}',
        '    <button class="btn toggle-diffs" type="button" aria-pressed="false">Collapse all diffs</button>',
        "  </div>",
    ]
    changes += [render_section(section, numbers[section["id"]]) for section in data["sections"]]
    faq = "\n".join(
        f'    <details class="faq"><summary>{esc(entry["question"])}</summary><div>{entry["answer"]}</div></details>'
        for entry in data["faq"]
    )
    quiz = (
        "  <p>Pick an answer to see whether it's right and why.</p>\n"
        '  <div class="quiz-bar">\n'
        '    <div class="progress" aria-hidden="true"><i id="qprog"></i></div>\n'
        '    <span class="score" id="qcount" aria-live="polite">0 answered · 0 correct</span>\n'
        '    <button class="btn" type="button" id="qreset">Clear answers</button>\n'
        "  </div>\n"
        '  <div id="quiz-list"></div>'
    )
    return "".join([
        f'<header class="intro">\n  <h1>{esc(data["title"])}</h1>\n  <p class="lede">{data["lede"]}</p>\n</header>\n\n',
        render_chapter("orientation", f'  {data["orientation"]}'),
        render_chapter("problem", f'  {data["problem"]}'),
        render_chapter("solution", f'  {data["solution"]}'),
        render_chapter("intuition", "\n".join(intuition)),
        render_chapter("map", render_map(data["map"], numbers)),
        render_chapter("changes", "\n".join(changes)),
        render_chapter("faq", f'  <div class="faq-list">\n{faq}\n  </div>'),
        render_chapter("quiz", quiz),
    ])


# Fields that hold code, ids or settings rather than text the reader sees.
NOT_PROSE_KEYS = {"hunk", "path", "id", "section", "kind", "style", "type", "badge", "correct", "emphasis"}


def prose_lines(data, path: str = "") -> list[str]:
    """Every reader-facing string in the walkthrough, as "json.path: plain text", in page order."""
    if isinstance(data, dict):
        return [line for key, value in data.items() if key not in NOT_PROSE_KEYS
                for line in prose_lines(value, f"{path}.{key}" if path else key)]
    if isinstance(data, list):
        return [line for i, value in enumerate(data) for line in prose_lines(value, f"{path}[{i}]")]
    if isinstance(data, str) and data.strip():
        text = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", data))).strip()
        text = re.sub(r" ([.,;:!?)])", r"\1", text).replace("( ", "(")
        return [f"{path}: {text}"]
    return []


def quiz_json(data: dict) -> str:
    """The quiz as JSON that is safe inside a <script> element."""
    payload = {
        "key": re.sub(r"[^a-z0-9]+", "-", data["title"].lower()).strip("-"),
        "questions": [
            {k: q[k] for k in ("topic", "question", "options", "correct", "why")} for q in data["quiz"]
        ],
    }
    return json.dumps(payload, ensure_ascii=False).replace("</", "<\\/").replace("<!--", "<\\!--")


def render_walkthrough(data: dict, simulator_fragment: str = "", template: str | None = None) -> str:
    """Returns the walkthrough page HTML, or raises WalkthroughError."""
    validate_walkthrough(data)
    template = template if template is not None else TEMPLATE_PATH.read_text(encoding="utf-8")
    simulator_markup, simulator_script = split_simulator(simulator_fragment)
    numbers = section_numbers(data["sections"])
    slots = {
        "<!-- walkthrough:title -->": esc(data["title"]),
        "<!-- walkthrough:rail-title -->": esc(data["rail_title"]),
        "<!-- walkthrough:rail -->": render_rail(data, numbers),
        "<!-- walkthrough:main -->": render_main(data, simulator_markup),
        "<!-- walkthrough:quiz-json -->": quiz_json(data),
        "<!-- walkthrough:simulator-script -->": simulator_script,
    }
    for slot, content in slots.items():
        if template.count(slot) != 1:
            raise WalkthroughError([f"template: slot {slot} must appear exactly once"])
        template = template.replace(slot, content)
    return template


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Render an interactive walkthrough page from walkthrough.json.")
    parser.add_argument("walkthrough_json", type=Path, help="the walkthrough content")
    parser.add_argument("--simulator", type=Path, help="HTML fragment with the changeset's simulator markup and script")
    modes = parser.add_mutually_exclusive_group(required=True)
    modes.add_argument("--out", type=Path, help="where to write the page")
    modes.add_argument("--prose", action="store_true", help="print the reader-facing text for review instead of rendering")
    args = parser.parse_args(argv)
    try:
        data = json.loads(args.walkthrough_json.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        print(f"{ERROR_PREFIX} cannot read {args.walkthrough_json}: {error}", file=sys.stderr)
        return 1
    if args.prose:
        print("\n".join(prose_lines(data)))
        return 0
    fragment = args.simulator.read_text(encoding="utf-8") if args.simulator else ""
    try:
        page = render_walkthrough(data, fragment)
    except WalkthroughError as error:
        print(error, file=sys.stderr)
        return 1
    args.out.write_text(page, encoding="utf-8")
    print(f"Wrote {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
