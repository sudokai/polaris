#!/usr/bin/env python3
"""Check that the polaris plugin follows its porting rules.

Usage: python3 scripts/check_plugin.py [plugin_root]

Prints one line per problem as `path:line: message` and exits 1 if any are found.
"""

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path

EXPECTED_SKILLS = {
    "polaris",
    "architect",
    "blast-radius",
    "correct",
    "create-formal-verification-skill",
    "create-verification-skill",
    "decision-log",
    "deslop",
    "deslop-language",
    "diagnose",
    "discuss",
    "sharpen-domain-language",
    "model-domain",
    "record-architecture-decision",
    "figure-it-out",
    "finalize-plan",
    "no-change-detector-tests",
    "how",
    "ketchup",
    "lantern",
    "maintain-formal-verification-skill",
    "maintain-verification-skill",
    "polaris-help",
    "prove-it",
    "prototype",
    "recall",
    "reflect",
    "restate-my-intent",
    "setup-polaris",
    "sharpen",
    "show-me",
    "statechart",
    "say-it-plainly",
    "sweep-residue",
    "tdd",
    "technical-writing",
    "visual-pr",
    "walkthrough",
    "why",
    "write-discoverable-code",
}

# Hidden principle skills (docs/adr/0002-explicit-and-automatic-skill-invocation.md).
# A command needs a skill directory. They stay out of AGENT_INVOCABLE_SKILLS so an
# agent does not start a principle as a task.
PRINCIPLE_SLUGS = (
    "attack-the-premise",
    "boundary-discipline",
    "build-the-lever",
    "encode-lessons-in-structure",
    "exhaust-the-design-space",
    "experience-first",
    "explain-the-number",
    "fix-root-causes",
    "foundational-thinking",
    "guard-the-context-window",
    "laziness-protocol",
    "make-operations-idempotent",
    "migrate-callers-then-delete-legacy-apis",
    "minimize-reader-load",
    "model-the-domain",
    "never-block-on-the-human",
    "outcome-oriented-execution",
    "prove-it-works",
    "redesign-from-first-principles",
    "separate-before-serializing-shared-state",
    "sequence-verifiable-units",
    "subtract-before-you-add",
    "test-behavior-not-implementation",
    "type-system-discipline",
)
PRINCIPLE_SKILLS = {f"principle-{slug}" for slug in PRINCIPLE_SLUGS}

# Skills that an agent may start on its own. Invocation policy is in
# docs/adr/0002-explicit-and-automatic-skill-invocation.md. A skill belongs here
# only when all three hold:
#   1. It is useful without the router.
#   2. It is cheap: it starts no fan-out of subagents and writes nothing beyond the task.
#   3. The user wants it in sessions that did not start with `/polaris`.
# Every other skill except the router is hidden: `disable-model-invocation: true`,
# and in Codex `allow_implicit_invocation: false` in `agents/openai.yaml`.
AGENT_INVOCABLE_SKILLS = {
    "decision-log",
    "deslop",
    "deslop-language",
    "diagnose",
    "discuss",
    "sharpen-domain-language",
    "model-domain",
    "record-architecture-decision",
    "no-change-detector-tests",
    "ketchup",
    "lantern",
    "prototype",
    "prove-it",
    "restate-my-intent",
    "sweep-residue",
    "tdd",
    "technical-writing",
    "walkthrough",
    "write-discoverable-code",
}

# Lowercase "cursor" is a common programming word, such as a pagination cursor, so only
# the capitalized name and the `.cursor` directory count as the Cursor harness.
HARNESS_SPECIFIC_TERMS = re.compile(
    r"(?-i:\bCursor\b)|\.cursor\b|\bgrok|\bcomposer|\bbugbot|\.mdc\b|\bpoteto|\bpstack|\bAskQuestion|\bsubagent_type",
    re.IGNORECASE,
)

# Files that hold harness-specific facts on purpose, relative to `skills/`.
HARNESS_FACT_FILES = (
    "polaris/references/models.md",
    "polaris/references/model-profiles/",
    "polaris/references/harnesses.md",
    "polaris/references/rendering-pictures.md",
    "polaris/references/writing-global-instructions.md",
    "setup-polaris/",
)

MARKDOWN_LINK = re.compile(r"\]\(([^)\s]+)\)")
BACKTICKED_PATH = re.compile(r"`((?:(?:\.\./|\./)+|(?:references|principles|playbooks)/)[^`\s<>*]+|[\w-]+\.md(?:#[^`\s]+)?)`")

# Supported work kind/level combinations; unclassified is validated separately.
WORK_ASSIGNMENTS = {
    ("execution", "regular"), ("execution", "complex"),
    ("reasoning", "scoped"), ("reasoning", "hard"), ("reasoning", "very_hard"),
}
MODEL_PROFILES = {"claude", "gpt", "xai", "deepseek", "glm"}


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
    expected = EXPECTED_SKILLS | PRINCIPLE_SKILLS
    found = {path.parent.name for path in skills_dir.glob("*/SKILL.md")}
    for name in sorted(expected - found):
        problems.append(Problem(skills_dir, 0, f"missing skill directory `{name}`"))
    for name in sorted(found - expected):
        problems.append(Problem(skills_dir / name, 0, f"unexpected skill `{name}`"))
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
    problems = []
    for skill_file in sorted(skills_dir.glob("*/SKILL.md")):
        name = skill_file.parent.name
        if name == "polaris":
            continue
        should_hide = name not in AGENT_INVOCABLE_SKILLS
        fields = frontmatter_fields(skill_file.read_text()) or {}
        sidecar = skill_file.parent / "agents" / "openai.yaml"
        hidden_from_model = fields.get("disable-model-invocation") == "true"
        hidden_from_codex = sidecar.exists() and "allow_implicit_invocation: false" in sidecar.read_text()
        expected = "hidden" if should_hide else "agent-invocable"
        rule = (
            "see docs/adr/0002-explicit-and-automatic-skill-invocation.md "
            "for which skills belong in AGENT_INVOCABLE_SKILLS"
        )
        if hidden_from_model != should_hide:
            problems.append(
                Problem(skill_file, 1, f"{expected} skill has the wrong `disable-model-invocation`; {rule}")
            )
        if hidden_from_codex != should_hide:
            problems.append(Problem(sidecar, 0, f"{expected} skill has the wrong `allow_implicit_invocation`; {rule}"))
    return problems


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
    in_code_block = False
    for line in destination.read_text().splitlines():
        if line.lstrip().startswith(("```", "~~~")):
            in_code_block = not in_code_block
            continue
        if in_code_block:
            continue
        match = re.match(r"^#{1,6} +(.+?)(?: +#+)?$", line)
        if match:
            slug = re.sub(r"[^\w\- ]", "", match.group(1).lower()).replace(" ", "-")
            count = counts.get(slug, 0)
            counts[slug] = count + 1
            headings.add(f"{slug}-{count}" if count else slug)
    return anchor in headings


def check_links(skills_dir: Path) -> list[Problem]:
    problems = []
    for md_file in sorted(skills_dir.rglob("*.md")):
        in_code_block = False
        for number, line in enumerate(md_file.read_text().splitlines(), start=1):
            if line.lstrip().startswith("```"):
                in_code_block = not in_code_block
                continue
            if in_code_block:
                continue
            targets = [m.group(1) for m in MARKDOWN_LINK.finditer(line)]
            targets += [m.group(1) for m in BACKTICKED_PATH.finditer(line)
                        if not line[:m.start()].endswith("[")]
            for target in targets:
                if re.match(r"^[a-z]+:", target):
                    continue
                if target == "SKILL.md":
                    continue
                if "/" not in target and "#" not in target and not (md_file.parent / target).exists():
                    if not any(skills_dir.rglob(target)):
                        continue
                if not resolves(target, md_file):
                    problems.append(Problem(md_file, number, f"document reference `{target}` does not resolve from its containing file or names a missing heading"))
    return problems


def check_harness_terms(skills_dir: Path) -> list[Problem]:
    problems = []
    for md_file in sorted(skills_dir.rglob("*")):
        if not md_file.is_file():
            continue
        relative = md_file.relative_to(skills_dir).as_posix()
        if relative.startswith(HARNESS_FACT_FILES):
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
    legacy = skills_dir / "polaris" / "principles"
    if legacy.exists():
        problems.append(Problem(legacy, 0, "principles are skills named `principle-<slug>`; delete this directory"))
    for slug in PRINCIPLE_SLUGS:
        if f"`principle-{slug}`" not in router_text:
            problems.append(Problem(router, 0, f"principle `{slug}` is missing from the principle index"))
    for playbook in sorted((skills_dir / "polaris" / "playbooks").glob("*.md")):
        if playbook.name == "README.md":
            continue
        playbook_title = playbook.stem.replace("-", " ").capitalize()
        if f"**{playbook_title}.**" not in router_text and f"playbooks/{playbook.name}" not in router_text:
            problems.append(Problem(router, 0, f"playbook `{playbook.name}` is missing from the playbook index"))
    return problems


def check_model_profiles(skills_dir: Path) -> list[Problem]:
    """Reject incomplete kind/level or unclassified tables and excluded efforts."""
    profiles_dir = skills_dir / "polaris" / "references" / "model-profiles"
    problems = []
    found = {path.stem for path in profiles_dir.glob("*.md")}
    for name in sorted(MODEL_PROFILES - found):
        problems.append(Problem(profiles_dir, 0, f"missing model profile `{name}`"))
    for profile_file in sorted(profiles_dir.glob("*.md")):
        assignments: list[tuple[str, ...]] = []
        table_type = None
        table_types = []
        for number, line in enumerate(profile_file.read_text().splitlines() + [""], start=1):
            if line.startswith("| Kind |") or line.startswith("| Fallback |"):
                table_type = "assignments" if line.startswith("| Kind |") else "fallback"
                table_types.append(table_type)
                continue
            if line.startswith("| ---"):
                continue
            if not line.startswith("| `"):
                if table_type is not None:
                    expected = WORK_ASSIGNMENTS if table_type == "assignments" else {("unclassified",)}
                    if len(assignments) != len(expected) or set(assignments) != expected:
                        problems.append(Problem(profile_file, number, "allocation table must cover each kind/level or unclassified fallback once"))
                    assignments = []
                    table_type = None
                continue
            cells = [cell.strip() for cell in line.strip("|").split("|")]
            if table_type is None:
                problems.append(Problem(profile_file, number, "allocation row needs a Kind/Level or Fallback table header"))
                continue
            key_width = 2 if table_type == "assignments" else 1
            assignments.append(tuple(cell.strip("`") for cell in cells[:key_width]))
            if len(cells) != key_width + 4 or any(not cell for cell in cells):
                problems.append(Problem(profile_file, number, "allocation row needs a complete assignment and four budget pairs"))
                continue
            for cell in cells[key_width:]:
                effort = cell.split()[-1].lower()
                if cell == "Composer" and profile_file.stem == "xai":
                    continue
                if effort not in {"low", "medium", "high", "xhigh", "max"}:
                    problems.append(Problem(profile_file, number, f"unknown allocation effort `{effort}`"))
                elif profile_file.stem in {"claude", "gpt", "xai"} and effort == "max":
                    problems.append(Problem(profile_file, number, "use xhigh instead of max in this profile"))
                elif profile_file.stem == "glm" and effort not in {"high", "max"}:
                    problems.append(Problem(profile_file, number, "GLM allocations use high or max only"))
                elif profile_file.stem == "deepseek" and effort not in {"low", "high", "max"}:
                    problems.append(Problem(profile_file, number, "DeepSeek allocations require native low/high/max effort"))
        expected_tables = ["assignments", "fallback"] * (2 if profile_file.stem == "xai" else 1)
        if table_types != expected_tables:
            problems.append(Problem(profile_file, 0, "each profile allocation table needs a separate unclassified fallback table; xAI also needs its Grok-only tables"))
    return problems


def check_model_agents(root: Path) -> list[Problem]:
    """Check that shipped pair agents have valid fields and Claude can discover them."""
    problems = []
    claude_dir = root / "com.anthropic.claude-code" / "agents"
    for directory in (root / "agents", claude_dir):
        for agent_file in sorted(directory.glob("*.md")):
            fields = frontmatter_fields(agent_file.read_text()) or {}
            for key in ("name", "description", "model", "effort"):
                if not fields.get(key):
                    problems.append(Problem(agent_file, 1, f"model-pair agent missing `{key}`"))
            if fields.get("name") != agent_file.stem:
                problems.append(Problem(agent_file, 1, "agent name must match its filename"))
            if fields.get("effort") not in {None, "low", "medium", "high", "xhigh"}:
                problems.append(Problem(agent_file, 1, "unsupported effort in bundled model-pair agent"))
            if agent_file.stem in {"ultra", "deep", "standard", "fast"}:
                problems.append(Problem(agent_file, 1, "replace legacy role agent with a model-pair agent"))
    manifest = root / ".claude-plugin" / "plugin.json"
    try:
        registered = json.loads(manifest.read_text()).get("agents", [])
        expected = {"./" + str(path.relative_to(root)) for path in claude_dir.glob("*.md")}
        if not isinstance(registered, list) or any(not isinstance(path, str) for path in registered):
            problems.append(Problem(manifest, 0, "agents must be a list of model-pair definition paths"))
        elif set(registered) != expected or len(registered) != len(expected):
            problems.append(Problem(manifest, 0, "register each shipped Claude model-pair agent exactly once"))
    except (OSError, ValueError) as error:
        problems.append(Problem(manifest, 0, f"cannot read agent registrations: {error}"))
    portable_manifest = root / "plugin.json"
    try:
        if "agents" in json.loads(portable_manifest.read_text()):
            problems.append(Problem(portable_manifest, 0, "portable manifest must not register harness-specific agents"))
    except (OSError, ValueError) as error:
        problems.append(Problem(portable_manifest, 0, f"cannot read portable manifest: {error}"))
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
        + check_router_indexes(skills_dir)
        + check_model_profiles(skills_dir)
        + check_model_agents(root)
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
