# Open work

## Not yet verified

- **`disable-model-invocation` in Codex and Hermes.** If either ignores it, the hidden skills stay visible there. That is harmless, because the router still opens them by path.
- **Agent-invocable skills in each harness.** That the skills listed in `AGENT_INVOCABLE_SKILLS` in [the validator](../scripts/check_plugin.py) start on their own outside `/polaris`, and that the commands in [Typing a skill command](../skills/polaris/references/harnesses.md#typing-a-skill-command) are right outside Claude Code and pi.
- **Hermes:** whether its skill management tool can create new skills.
- **`dsh`:** the `max` effort level and the `deepseek-flash` model, and loading in `dsh-tui` and the desktop app. `dsh-tui` needs a terminal, and no headless profile exists to test it.
- **Grok Build:** that model-pair agents apply their selected pair to a running child. The latest bounded CLI probe exposed no usable spawn tool; the Composer ID known from Hermes was rejected by the local CLI. See [model budget verification](model-budget-verification.md).
- **Cursor:** that a local plugin in `~/.cursor/plugins/local/` loads. Check it in the editor: the command-line agent does not load `~/.cursor/rules/agents.mdc`, so a one-shot run is no test.
- **Claude Code:** `claude -p` loads `~/.claude/AGENTS.md` in a directory under `~` but not under `/tmp`.

## Deferred

- **More playbooks from pstack.** Hillclimb and Visual parity are good candidates. Babysit, Shipping, Autopilot, Orchestrate, and Multi-phase plan depend on Cursor, Bugbot, or large pull request programs.
- **`make-pr-easy-to-review`.** It also writes PR descriptions. Decide whether to fold it in once `visual-pr` is in use.
- **Roadmap:** the user's own playbooks, multi-phase planning, parallel agents in separate worktrees building feature slices, and reviews from other model families through another harness's command-line tool.
