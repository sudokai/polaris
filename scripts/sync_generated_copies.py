#!/usr/bin/env python3
"""Regenerate the copies listed in GENERATED_COPIES in check_plugin.py from their sources.

Usage: python3 scripts/sync_generated_copies.py [plugin_root]

Prints each copy it rewrote. Edit the source file, never the copy, then run this script.
"""

from __future__ import annotations

import sys
from pathlib import Path

from check_plugin import GENERATED_COPIES, generated_copy_text


def sync_generated_copies(skills_dir: Path, copies: dict[str, str] = GENERATED_COPIES) -> list[Path]:
    """Write each copy from its source and return the copies whose content changed."""
    changed = []
    for copy_path, source_path in sorted(copies.items()):
        copy_file = skills_dir / copy_path
        text = generated_copy_text((skills_dir / source_path).read_text())
        if copy_file.is_file() and copy_file.read_text() == text:
            continue
        copy_file.parent.mkdir(parents=True, exist_ok=True)
        copy_file.write_text(text)
        changed.append(copy_file)
    return changed


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    changed = sync_generated_copies(root / "skills")
    for copy_file in changed:
        print(f"rewrote {copy_file.relative_to(root)}")
    if not changed:
        print("all generated copies are current")
    return 0


if __name__ == "__main__":
    sys.exit(main())
