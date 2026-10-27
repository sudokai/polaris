# Syncing from pstack

polaris ports changes from [pstack](https://github.com/cursor/plugins/tree/main/pstack) by hand. Run `/sync-pstack` ([Sync pstack](../.agents/skills/sync-pstack/SKILL.md)) to review new commits, port the approved ones, and update this file. To find what is new by hand, list the pstack commits after the last synced commit:

```sh
git log --oneline <last synced commit>..origin/main -- pstack
```

Update the last synced commit after each sync. If you skip a pstack commit on purpose, record it and the reason under Skipped.

## Last synced commit

`519d36aa98955bf680db01bcde5fdfba686dc901` (2026-10-26, "test(pstack): wait for the reap in the statechart SIGKILL view test (#981)")

## Skipped

- Version bumps and Cursor-specific guide pages under `pstack/docs/guide/`, which polaris has no equivalent for.
- The Claude Code install note in `poteto-help`, which describes pstack's own install.
- The `ketchup-video` skill (`3c0fdb4`), which polaris has not adopted.
- Fixes to the `poteto-mode` scripts `check-plan`, `orch`, `watch-pr`, and `worktree-audit` (`86c2448`, `3c596e7`, `fe096ef`, `96dec8e`, `f83fbe6`), which polaris does not ship.
- Step renumbering in `swarm` (`e73df47`), which polaris has no counterpart for.
