# Syncing from pstack

polaris ports changes from [pstack](https://github.com/cursor/plugins/tree/main/pstack) by hand. Run `/sync-pstack` ([Sync pstack](../.agents/skills/sync-pstack/SKILL.md)) to review new commits, port the approved ones, and update this file. To find what is new by hand, list the pstack commits after the last synced commit:

```sh
git log --oneline <last synced commit>..origin/main -- pstack
```

Update the last synced commit after each sync. If you skip a pstack commit on purpose, record it and the reason under Skipped.

## Last synced commit

`c742dd61706fbacc1b95f1a20b7b988cf096ce6c` (2026-10-27, "feat(pstack): make Orchestrate agentic and delete the orch scripts (#1043)")

## Skipped

- Version bumps and Cursor-specific guide pages under `pstack/docs/guide/`, which polaris has no equivalent for.
- The Claude Code install note in `poteto-help`, which describes pstack's own install.
- The `ketchup-video` skill (`3c0fdb4`), which polaris has not adopted.
- Fixes to the `poteto-mode` scripts `check-plan`, `orch`, `watch-pr`, and `worktree-audit` (`86c2448`, `3c596e7`, `fe096ef`, `96dec8e`, `f83fbe6`), which polaris does not ship.
- Step renumbering in `swarm` (`e73df47`), which polaris has no counterpart for.
- Changes to `interrogate`, `arena`, and the arena cross-judge pool in `setup-pstack` (`ab1f702`), which polaris does not ship.
- Changes to the Autopilot-full, Autopilot-stack, Orchestrate, Babysit, Multi-phase plan, Opening a PR, and Autonomous run playbooks (`ab1f702`), and the Orchestrate rewrite that deletes the `orch` scripts (`c742dd6`). polaris has none of these playbooks.
- The model fallback chain for a rejected Task slug in `poteto-mode` (`ab1f702`). polaris's model budgets already have their own fallback rules, and the chain is specific to Cursor model slugs.
- Subtitles in `ketchup-video` (`ab1f702`).
