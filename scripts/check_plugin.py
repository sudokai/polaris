#!/usr/bin/env python3
"""Check that the polaris plugin follows its porting rules.

Usage: python3 scripts/check_plugin.py [plugin_root]

Prints one line per problem as `path:line: message` and exits 1 if any are found.
"""

from __future__ import annotations

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
    "diagnose",
    "discuss",
    "domain-modeling",
    "figure-it-out",
    "fix-change-detector-tests",
    "how",
    "ketchup",
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
    "speak-human",
    "sweep-residue",
    "tdd",
    "visual-pr",
    "why",
    "write-discoverable-code",
}

# Skills that an agent may start on its own (docs/adr/0013). A skill belongs here
# only when all three hold:
#   1. It is useful without the router.
#   2. It is cheap: it starts no fan-out of subagents and writes nothing beyond the task.
#   3. The user wants it in sessions that did not start with `/polaris`.
# Every other skill except the router is hidden: `disable-model-invocation: true`,
# and in Codex `allow_implicit_invocation: false` in `agents/openai.yaml`.
AGENT_INVOCABLE_SKILLS = {
    "decision-log",
    "deslop",
    "diagnose",
    "discuss",
    "domain-modeling",
    "fix-change-detector-tests",
    "ketchup",
    "prototype",
    "prove-it",
    "restate-my-intent",
    "sweep-residue",
    "tdd",
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
    "polaris/references/harnesses.md",
    "setup-polaris/",
)

MARKDOWN_LINK = re.compile(r"\]\(([^)#\s]+)(?:#[^)]*)?\)")
BACKTICKED_PATH = re.compile(r"`((?:\.\./)+[^`\s<>*]+\.md|(?:references|principles|playbooks)/[^`\s<>*]+)`")


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
    found = {path.parent.name for path in skills_dir.glob("*/SKILL.md")}
    for name in sorted(EXPECTED_SKILLS - found):
        problems.append(Problem(skills_dir, 0, f"missing skill directory `{name}`"))
    for name in sorted(found - EXPECTED_SKILLS):
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
        rule = "see docs/adr/0013 for which skills belong in AGENT_INVOCABLE_SKILLS"
        if hidden_from_model != should_hide:
            problems.append(
                Problem(skill_file, 1, f"{expected} skill has the wrong `disable-model-invocation`; {rule}")
            )
        if hidden_from_codex != should_hide:
            problems.append(Problem(sidecar, 0, f"{expected} skill has the wrong `allow_implicit_invocation`; {rule}"))
    return problems


def resolves(target: str, md_file: Path, skill_root: Path) -> bool:
    return (md_file.parent / target).exists() or (skill_root / target).exists()


def check_links(skills_dir: Path) -> list[Problem]:
    problems = []
    for md_file in sorted(skills_dir.rglob("*.md")):
        skill_root = skills_dir / md_file.relative_to(skills_dir).parts[0]
        in_code_block = False
        for number, line in enumerate(md_file.read_text().splitlines(), start=1):
            if line.lstrip().startswith("```"):
                in_code_block = not in_code_block
                continue
            if in_code_block:
                continue
            targets = [m.group(1) for m in MARKDOWN_LINK.finditer(line)]
            targets += [m.group(1) for m in BACKTICKED_PATH.finditer(line)]
            for target in targets:
                if re.match(r"^[a-z]+:", target) or not re.search(r"[./]", target):
                    continue
                if not resolves(target, md_file, skill_root):
                    problems.append(Problem(md_file, number, f"link target `{target}` does not exist"))
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
    for principle in sorted((skills_dir / "polaris" / "principles").glob("*.md")):
        if f"principles/{principle.name}" not in router_text:
            problems.append(Problem(router, 0, f"principle `{principle.name}` is missing from the principle index"))
    for playbook in sorted((skills_dir / "polaris" / "playbooks").glob("*.md")):
        if playbook.name == "README.md":
            continue
        if f"playbooks/{playbook.name}" not in router_text:
            problems.append(Problem(router, 0, f"playbook `{playbook.name}` is missing from the playbook index"))
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
