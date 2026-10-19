# Only the router is selected automatically

The router is the only skill an agent can pick on its own. Every other bundled skill sets `disable-model-invocation: true`, and in Codex also `policy.allow_implicit_invocation: false` in `agents/openai.yaml`. The router and the skills open each other by file path, such as `../how/SKILL.md`, which works because every harness tells the agent where a loaded skill's file is. This keeps 13 task skill descriptions out of every session and stops them from triggering without polaris. The user can still type a skill's slash command directly.

The router itself does not set `disable-model-invocation`, so the model can still select it. Its description limits it to `/polaris`, which is how the user starts it.

## Consequences

- When a polaris skill should have run but did not, the fix is a trigger line, not a description edit. Nothing reads a hidden skill's description when choosing what to run.
- A general delegate, such as a code-writing subagent, is briefed to read the router first. A subagent that a skill starts with its own focused prompt does not read the router. This replaces pstack's `poteto-agent` definition, which no other harness can load.
