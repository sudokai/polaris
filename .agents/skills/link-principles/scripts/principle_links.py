"""Map polaris principles to the skills an agent can start on its own that link to them.

Usage: python3 principle_links.py <repo>

Lists each principle with its linking skills, then the principles no such skill links to
and the skills that link to no principle. Principles and skills named in
`unlinked-on-purpose.md` next to this script's skill are left out of both lists.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

repo = Path(sys.argv[1]).resolve()
sys.dont_write_bytecode = True
sys.path.insert(0, str(repo / "scripts"))
from check_plugin import AGENT_INVOCABLE_SKILLS  # noqa: E402

skills_dir = repo / "skills"
exclusions_file = Path(__file__).resolve().parent.parent / "unlinked-on-purpose.md"
excluded = set(re.findall(r"^- `([a-z-]+)`", exclusions_file.read_text(), re.M)) if exclusions_file.exists() else set()

principles = sorted(p.stem for p in (skills_dir / "polaris" / "principles").glob("*.md"))
skill_texts = {s: (skills_dir / s / "SKILL.md").read_text() for s in sorted(AGENT_INVOCABLE_SKILLS)}

unlinked = []
for principle in principles:
    linking = [s for s, text in skill_texts.items() if f"principles/{principle}.md" in text]
    print(f"{principle}: {' '.join(linking) or '-'}")
    if not linking and principle not in excluded:
        unlinked.append(principle)

skills_without_links = [s for s, text in skill_texts.items() if "principles/" not in text and s not in excluded]

print(f"\nUnlinked principles ({len(unlinked)}): {' '.join(unlinked) or 'none'}")
print(f"Left out on purpose: {' '.join(sorted(excluded)) or 'none'}")
print(f"Skills that link to no principle ({len(skills_without_links)}): {' '.join(skills_without_links) or 'none'}")
