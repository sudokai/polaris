# Role agents for Claude Code and Grok Build

polaris ships one agent definition per role for the harnesses that cannot set effort when they start a subagent: `com.anthropic.claude-code/agents/` for Claude Code and `agents/` for Grok Build. Claude Code can set a subagent's model per spawn but its effort only in an agent definition, so without these files the three Opus roles would run the same. Grok Build can set neither, only the agent type. Agent definitions are outside the Agent Plugins portable core, so these files are a deliberate exception.

## Consequences

- In these two harnesses a model override is an agent file named `polaris-<role>.md` in the harness's project or user `agents/` directory, not a line in `models.md`. A line in `models.md` cannot change a plugin agent's effort.
- The two sets live in separate directories. Claude Code does not auto-load `agents/` when `.claude-plugin/plugin.json` lists agents, and an `agents` field on the root `plugin.json` makes `hermes plugins validate` fail.
- Codex, Cursor, and `dsh` set model and effort per spawn and need no agent files. pi has no built-in subagents. Hermes sets one model for every subagent, so agent files would not help.
- `com.anthropic.claude-code` follows the Agent Plugins reverse-domain convention, but it is our choice, not a documented namespace.
