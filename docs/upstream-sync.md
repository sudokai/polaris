# Syncing from pstack

polaris ports changes from [pstack](https://github.com/cursor/plugins/tree/main/pstack) by hand. Run `/sync-pstack` (`.agents/skills/sync-pstack/SKILL.md`) to review new commits, port the approved ones, and update this file. To find what is new by hand, list the pstack commits after the last synced commit:

```sh
git log --oneline <last synced commit>..origin/main -- pstack
```

Update the last synced commit after each sync. If you skip a pstack commit on purpose, record it and the reason under Skipped.

## Last synced commit

`88d47514b82e7c44f00f2b2a72ff6dd12158038c` (2026-10-19, "pstack: restore /sharpen to the original prompt, return only the rewrite (#729)")

## Skipped

- Version bumps and Cursor-specific guide pages under `pstack/docs/guide/`, which polaris has no equivalent for.
- The Claude Code install note in `poteto-help`, which describes pstack's own install.
