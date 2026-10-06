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
    "create-verification-skill",
    "figure-it-out",
    "how",
    "maintain-verification-skill",
    "prove-it",
    "recall",
    "reflect",
    "setup-polaris",
    "show-me-your-work",
    "why",
}

HARNESS_SPECIFIC_TERMS = re.compile(
    r"\bcursor|\bgrok|\bcomposer|\bbugbot|\.mdc\b|\bpoteto|\bpstack|\bAskQuestion|\bsubagent_type",
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
        override_path = f".agents/polaris/skills/{skill_file.parent.name}/SKILL.md"
        if override_path not in skill_file.read_text():
            problems.append(Problem(skill_file, 0, f"missing the override line that names `{override_path}`"))
        if fields.get("name") and fields["name"] != skill_file.parent.name:
            problems.append(
                Problem(skill_file, 1, f"name `{fields['name']}` does not match directory `{skill_file.parent.name}`")
            )
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
