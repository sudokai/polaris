#!/usr/bin/env python3
"""Check that the polaris plugin follows its porting rules.

Usage: python3 scripts/check_plugin.py [plugin_root]

Prints one line per problem as `path:line: message` and exits 1 if any are found.
"""

from __future__ import annotations

import json
import re
import sys
from collections.abc import Iterator
from dataclasses import dataclass
from pathlib import Path

# The engineering-principles skill indexes the principle files beside its SKILL.md.
PRINCIPLES_SKILL = "engineering-principles"
# Principles are files in the engineering-principles skill, not skills named like `principle-prove-it-works`.
LEGACY_PRINCIPLE_REFERENCE = re.compile(r"\bprinciple-[a-z]+(?:-[a-z]+)*")

# Lowercase "cursor" is a common programming word, such as a pagination cursor, so only
# the capitalized name and the `.cursor` directory count as the Cursor harness.
HARNESS_SPECIFIC_TERMS = re.compile(
    r"(?-i:\bCursor\b)|\.cursor\b|\bgrok|\bcomposer|\bbugbot|\.mdc\b|\bpoteto|\bpstack|\bAskQuestion|\bsubagent_type",
    re.IGNORECASE,
)

# Skills that coordinate other skills and may link into their folders. Every other skill
# must keep working when its folder is copied out of the plugin on its own.
COORDINATOR_SKILLS = {"polaris"}

# Files generated from a source file in another skill, so a skill can carry know-how it
# needs without linking outside its folder. Paths are relative to `skills/`. Edit the
# source, never the copy, then run scripts/sync_generated_copies.py. The copy is the
# source without its YAML frontmatter.
GENERATED_COPIES = {
    "self-improve/references/encode-lessons-in-structure.md": "engineering-principles/encode-lessons-in-structure.md",
    "diagnose/references/measured-numbers.md": "prove-it/references/measured-numbers.md",
    "visual-pr/references/show-me.md": "show-me/SKILL.md",
    "walkthrough/references/show-me.md": "show-me/SKILL.md",
}

# Skills installed by something other than this plugin that bundled skills may name.
EXTERNAL_SKILLS = {"librarian"}

# Slash commands that belong to a harness, not to a skill.
HARNESS_COMMANDS = {"create-skill", "model", "plugin", "reload-plugins"}

# Phrases that name a skill: "the `why` skill", "`polaris:why`", a slash command such as
# "`/why`" or "`/why <question>`", and router lines such as "→ `why`". Bare backticked
# words are not matched, because most of them are not skills.
SKILL_NAME = r"[a-z][a-z0-9]*(?:-[a-z0-9]+)*"
SKILL_REFERENCE = re.compile(
    rf"`(?:polaris:)?({SKILL_NAME})` skill\b|`polaris:({SKILL_NAME})`|→ `({SKILL_NAME})`|`/({SKILL_NAME})[` ]"
)

# A count of skills, principles, or playbooks, such as "24 engineering principles". Counts
# of two or fewer are ordinary prose, such as "a dependency between two skills".
INVENTORY_COUNT = re.compile(
    r"(?i)\b(?:[3-9]|\d{2,}|three|four|five|six|seven|eight|nine|ten|eleven|twelve|"
    r"\w+teen|twenty|thirty|forty|fifty)(?:-\w+)?\s+(?:\w+\s+)?(?:skills|principles|playbooks)\b"
)
# A line naming this many skills is an inventory. The router's triggers are exempt.
INVENTORY_NAMES = 4

MARKDOWN_LINK = re.compile(r"\]\(([^)\s]+)\)")
BACKTICKED_PATH = re.compile(r"`((?:(?:\.\./|\./)+|(?:references|principles|playbooks)/)[^`\s<>*]+|[\w-]+\.md(?:#[^`\s]+)?)`")

@dataclass(frozen=True)
class Problem:
    path: Path
    line: int
    message: str


def frontmatter_fields(text: str) -> dict[str, str] | None:
    match = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
    if match is None:
        return None
    fields = {}
    for line in match.group(1).splitlines():
        key, sep, value = line.partition(":")
        if sep and not line.startswith((" ", "\t", "-")):
            fields[key.strip()] = value.strip()
    return fields


def check_skill_frontmatter(skills_dir: Path) -> list[Problem]:
    problems = []
    for skill_file in sorted(skills_dir.glob("*/SKILL.md")):
        fields = frontmatter_fields(skill_file.read_text())
        if fields is None:
            problems.append(Problem(skill_file, 1, "missing YAML frontmatter"))
            continue
        for key in ("name", "description"):
            if not fields.get(key):
                problems.append(Problem(skill_file, 1, f"frontmatter has no `{key}`"))
        if fields.get("name") and fields["name"] != skill_file.parent.name:
            problems.append(
                Problem(skill_file, 1, f"name `{fields['name']}` does not match directory `{skill_file.parent.name}`")
            )
    return problems


def check_invocation(skills_dir: Path) -> list[Problem]:
    """Require Codex's sidecar to hide exactly the skills that hide themselves from the model.

    A skill's frontmatter decides whether an agent may start it on its own, per
    docs/decisions/2026-11-09-agent-invocable-skills.md. The router is exempt.
    """
    problems = []
    for skill_file in sorted(skills_dir.glob("*/SKILL.md")):
        if skill_file.parent.name == "polaris":
            continue
        fields = frontmatter_fields(skill_file.read_text()) or {}
        hidden_from_model = fields.get("disable-model-invocation") == "true"
        sidecar = skill_file.parent / "agents" / "openai.yaml"
        sidecar_text = sidecar.read_text() if sidecar.is_file() else ""
        # Codex allows implicit invocation when a skill has no sidecar setting.
        hidden_from_codex = "allow_implicit_invocation: false" in sidecar_text
        expected = "false" if hidden_from_model else "true"
        if hidden_from_codex != hidden_from_model:
            setting = "hides" if hidden_from_model else "does not hide"
            problems.append(Problem(
                sidecar, 0,
                f"frontmatter {setting} this skill from the model, so set `allow_implicit_invocation: {expected}`",
            ))
    return problems


FENCE = re.compile(r"(`{3,}|~{3,})(.*)")


def outside_code_blocks(text: str) -> Iterator[tuple[int, str]]:
    """Yield numbered Markdown lines that are outside fenced code blocks.

    A block opens with three or more backticks or tildes, and closes only with a run of the
    same character at least as long and nothing after it, so a block can show other fences.
    """
    fence = None
    for number, line in enumerate(text.splitlines(), start=1):
        match = FENCE.match(line.lstrip())
        if fence is None:
            if match and not (match[1][0] == "`" and "`" in match[2]):
                fence = match[1]
            else:
                yield number, line
        elif match and match[1][0] == fence[0] and len(match[1]) >= len(fence) and not match[2].strip():
            fence = None


def resolves(target: str, md_file: Path) -> bool:
    """Resolve a document reference from its containing file, including heading anchors."""
    file_name, separator, anchor = target.partition("#")
    destination = md_file.parent / file_name if file_name else md_file
    if not destination.exists():
        return False
    if not separator:
        return True
    if not destination.is_file():
        return False
    headings = set()
    counts = {}
    for _, line in outside_code_blocks(destination.read_text()):
        match = re.match(r"^#{1,6} +(.+?)(?: +#+)?$", line)
        if match:
            slug = re.sub(r"[^\w\- ]", "", match.group(1).lower()).replace(" ", "-")
            count = counts.get(slug, 0)
            counts[slug] = count + 1
            headings.add(f"{slug}-{count}" if count else slug)
    return anchor in headings


def prose_lines(md_file: Path) -> Iterator[tuple[int, str]]:
    """Yield numbered lines of a Markdown file, skipping fenced code blocks."""
    yield from outside_code_blocks(md_file.read_text(errors="replace"))


def document_references(md_file: Path) -> Iterator[tuple[int, str]]:
    """Yield each linked or backticked document path in a Markdown file, except URLs."""
    for number, line in prose_lines(md_file):
        targets = [m.group(1) for m in MARKDOWN_LINK.finditer(line)]
        targets += [m.group(1) for m in BACKTICKED_PATH.finditer(line)
                    if not line[:m.start()].endswith("[")]
        for target in targets:
            if not re.match(r"^[a-z]+:", target):
                yield number, target


def check_links(skills_dir: Path) -> list[Problem]:
    problems = []
    for md_file in sorted(skills_dir.rglob("*.md")):
        for number, target in document_references(md_file):
            if target == "SKILL.md":
                continue
            if "/" not in target and "#" not in target and not (md_file.parent / target).exists():
                if not any(skills_dir.rglob(target)):
                    continue
            if not resolves(target, md_file):
                problems.append(Problem(md_file, number, f"document reference `{target}` does not resolve from its containing file or names a missing heading"))
    return problems


def check_self_contained_skills(skills_dir: Path) -> list[Problem]:
    """Reject links that leave a skill's folder, which break when the folder is copied out."""
    problems = []
    for md_file in sorted(skills_dir.rglob("*.md")):
        skill_dir = skills_dir / md_file.relative_to(skills_dir).parts[0]
        if skill_dir.name in COORDINATOR_SKILLS:
            continue
        for number, target in dict.fromkeys(document_references(md_file)):
            path = target.partition("#")[0]
            if "/" not in path:
                continue
            if not (md_file.parent / path).resolve().is_relative_to(skill_dir.resolve()):
                problems.append(Problem(
                    md_file, number,
                    f"`{target}` leaves the `{skill_dir.name}` folder; name the skill and the result you need, "
                    "or carry the file as a generated copy",
                ))
    return problems


def generated_copy_text(source_text: str) -> str:
    """Return what a generated copy of `source_text` must contain: the source without frontmatter."""
    return re.sub(r"^---\n.*?\n---\n", "", source_text, count=1, flags=re.DOTALL).lstrip("\n")


def check_generated_copies(skills_dir: Path, copies: dict[str, str] = GENERATED_COPIES) -> list[Problem]:
    """Reject a generated copy that is missing or differs from its source."""
    problems = []
    for copy_path, source_path in sorted(copies.items()):
        copy_file, source_file = skills_dir / copy_path, skills_dir / source_path
        if not source_file.is_file():
            problems.append(Problem(copy_file, 0, f"source `{source_path}` of this generated copy does not exist"))
        elif not copy_file.is_file():
            problems.append(Problem(copy_file, 0, f"generated copy of `{source_path}` is missing; run `python3 scripts/sync_generated_copies.py`"))
        elif copy_file.read_text() != generated_copy_text(source_file.read_text()):
            problems.append(Problem(copy_file, 0, f"generated copy is stale; run `python3 scripts/sync_generated_copies.py` to regenerate it from `{source_path}`"))
    return problems


def check_skill_names(root: Path) -> list[Problem]:
    """Reject names of skills that neither this plugin nor its maintainer skills provide."""
    skill_roots = [root / "skills", root / ".agents" / "skills"]
    known = EXTERNAL_SKILLS | {path.parent.name for base in skill_roots for path in base.glob("*/SKILL.md")}
    documents = [md_file for base in skill_roots for md_file in sorted(base.rglob("*.md"))]
    documents += [readme for readme in [root / "README.md"] if readme.is_file()]
    problems = []
    for md_file in documents:
        for number, line in prose_lines(md_file):
            for match in SKILL_REFERENCE.finditer(line):
                name = next(group for group in match.groups() if group)
                is_harness_command = match.group(4) is not None and name in HARNESS_COMMANDS
                if name not in known and not is_harness_command:
                    problems.append(Problem(md_file, number, f"names skill `{name}`, which does not exist"))
    return problems


def check_skill_inventories(root: Path) -> list[Problem]:
    """Reject counts and lists of skills, which go stale as skills are added or removed.

    The skill folders are the inventory. The router's triggers and the principles index
    route to skills and principles, so they are exempt.
    """
    known = {path.parent.name for path in (root / "skills").glob("*/SKILL.md")}
    exempt = {root / "skills" / "polaris" / "SKILL.md", root / "skills" / PRINCIPLES_SKILL / "SKILL.md"}
    documents = [root / "README.md", *sorted((root / "docs").rglob("*.md"))]
    documents += [md_file for base in ("skills", ".agents/skills") for md_file in sorted((root / base).rglob("*.md"))]
    problems = []
    for md_file in documents:
        if md_file in exempt or not md_file.is_file() or "vendor" in md_file.parts:
            continue
        for number, line in prose_lines(md_file):
            count = INVENTORY_COUNT.search(line)
            if count:
                problems.append(Problem(md_file, number, f"`{count.group(0)}` counts an inventory; describe it without a number"))
            names = {name for name in re.findall(rf"`/?(?:polaris:)?({SKILL_NAME})`", line) if name in known}
            if len(names) >= INVENTORY_NAMES:
                problems.append(Problem(
                    md_file, number,
                    f"names {len(names)} skills; point to where the skills are found instead of listing them",
                ))
    return problems


def check_harness_terms(skills_dir: Path) -> list[Problem]:
    problems = []
    for md_file in sorted(skills_dir.rglob("*")):
        if not md_file.is_file():
            continue
        for number, line in enumerate(md_file.read_text(errors="replace").splitlines(), start=1):
            match = HARNESS_SPECIFIC_TERMS.search(line)
            if match:
                problems.append(Problem(md_file, number, f"harness-specific term `{match.group(0)}`"))
    return problems


def check_router_indexes(skills_dir: Path) -> list[Problem]:
    router = skills_dir / "polaris" / "SKILL.md"
    router_text = router.read_text()
    problems = []
    for playbook in sorted((skills_dir / "polaris" / "playbooks").glob("*.md")):
        if playbook.name == "README.md":
            continue
        playbook_title = playbook.stem.replace("-", " ").capitalize()
        if f"**{playbook_title}.**" not in router_text and f"playbooks/{playbook.name}" not in router_text:
            problems.append(Problem(router, 0, f"playbook `{playbook.name}` is missing from the playbook index"))
    return problems


def check_principle_index(skills_dir: Path) -> list[Problem]:
    """Require each principle file to appear exactly once in the index, and no `principle-<slug>` names."""
    principles_dir = skills_dir / PRINCIPLES_SKILL
    index = principles_dir / "SKILL.md"
    index_targets = re.findall(r"\]\(([\w-]+\.md)\)", index.read_text())
    principle_files = {path.name for path in principles_dir.glob("*.md")} - {"SKILL.md"}
    problems = []
    for name in sorted(principle_files):
        count = index_targets.count(name)
        if count != 1:
            problems.append(Problem(index, 0, f"principle `{name}` is linked {count} times in the index; link it once"))
    for name in sorted(set(index_targets) - principle_files):
        problems.append(Problem(index, 0, f"index links `{name}`, which is not a principle file"))
    for md_file in sorted(skills_dir.rglob("*.md")):
        for number, line in enumerate(md_file.read_text().splitlines(), start=1):
            match = LEGACY_PRINCIPLE_REFERENCE.search(line)
            if match:
                problems.append(Problem(
                    md_file, number,
                    f"`{match.group(0)}` is not a skill; name the principle by its slug in `{PRINCIPLES_SKILL}`",
                ))
    return problems


def check_no_bundled_agents(root: Path) -> list[Problem]:
    """Reject bundled agent definitions; polaris ships skills only."""
    problems = []
    for name in ("agents", "droids", "com.anthropic.claude-code"):
        if (root / name).exists():
            problems.append(Problem(root / name, 0, "polaris ships no agent definitions"))
    manifests = (
        "plugin.json",
        ".claude-plugin/plugin.json",
        ".codex-plugin/plugin.json",
        ".cursor-plugin/plugin.json",
        ".factory-plugin/plugin.json",
    )
    for name in manifests:
        manifest = root / name
        if not manifest.exists():
            continue
        try:
            has_agents = "agents" in json.loads(manifest.read_text())
        except ValueError as error:
            problems.append(Problem(manifest, 0, f"cannot read manifest: {error}"))
            continue
        if has_agents:
            problems.append(Problem(manifest, 0, "manifest must not have an `agents` field"))
    return problems


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    skills_dir = root / "skills"
    if not skills_dir.is_dir():
        print(f"{skills_dir}: no skills directory")
        return 1
    problems = (
        check_skill_frontmatter(skills_dir)
        + check_invocation(skills_dir)
        + check_links(skills_dir)
        + check_harness_terms(skills_dir)
        + check_skill_inventories(root)
        + check_router_indexes(skills_dir)
        + check_principle_index(skills_dir)
        + check_no_bundled_agents(root)
        + check_self_contained_skills(skills_dir)
        + check_generated_copies(skills_dir)
        + check_skill_names(root)
    )
    for problem in problems:
        print(f"{problem.path.relative_to(root)}:{problem.line}: {problem.message}")
    if problems:
        print(f"{len(problems)} problem(s) found")
        return 1
    print("ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
