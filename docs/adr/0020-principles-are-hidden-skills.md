# Principles are hidden skills

Each principle is a hidden skill named `principle-<slug>`, so the user can run it as a command. This replaces [ADR 0002](0002-principles-are-plain-files.md).

ADR 0002 kept principles as plain files. A harness that ignores `disable-model-invocation` would otherwise list 24 descriptions in every session, and could start a principle as if it were a task. A command needs a skill directory, so that cost is accepted. The skills stay out of `AGENT_INVOCABLE_SKILLS`. They set `disable-model-invocation: true`, and in Codex `allow_implicit_invocation: false`. The router still applies a principle by reading its skill. An agent does not start one on its own.

## Considered options

- **One skill that takes a principle name.** Rejected. The command list would not show each principle, so the user could not pick one from the menu.
- **Make principle skills agent-invocable.** Rejected. A principle is a rule for a decision, not a task. [ADR 0013](0013-cheap-standalone-skills-start-on-their-own.md) still decides which skills start on their own.
