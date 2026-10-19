# Open work

## Not yet verified

- **`disable-model-invocation` in Codex and Hermes.** If either ignores it, the task skills stay visible there. That is harmless, because the router still opens them by path.
- **Hermes:** installing from a local path, and whether its skill management tool can create new skills.
- **`dsh`:** the `max` effort level and the `deepseek-flash` model, and loading in `dsh-tui` and the desktop app. `dsh-tui` needs a terminal, and no headless profile exists to test it.
- **Grok Build:** that a role agent's model and effort apply to a running subagent. The agent appeared on `spawn_subagent`, but no child was started.
- **Cursor:** that a local plugin in `~/.cursor/plugins/local/` loads. Check it in the editor: the command-line agent does not load `~/.cursor/rules/agents.mdc`, so a one-shot run is no test.
- **Claude Code:** `claude -p` loads `~/.claude/AGENTS.md` in a directory under `~` but not under `/tmp`.

## Deferred

- **More playbooks from pstack.** Hillclimb and Visual parity are good candidates. Babysit, Shipping, Autopilot, Orchestrate, and Multi-phase plan depend on Cursor, Bugbot, or large pull request programs.
- **Roadmap:** the user's own playbooks, multi-phase planning, parallel agents in separate worktrees building feature slices, and reviews from other model families through another harness's command-line tool.
