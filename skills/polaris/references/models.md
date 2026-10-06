# Model roles

Skills name a role, never a model. A role is a model plus a reasoning effort level. Use this file to turn a role into the model and effort for the harness you run in.

## When roles apply

Apply a role only where a skill already starts a subagent for one of these reasons:

- **Parallel work.** Several independent slices run at once.
- **An independent opinion.** The subagent judges work without having seen your reasoning.
- **Bulk reading.** Large files, logs, or transcripts stay out of your context.

Never start a subagent only to switch models. A subagent loses the context you have built up, so your own steps run on the session's model.

## Roles

- **`ultra`**: the few independent judgments where a mistake is expensive. For example, the judge that compares two design sketches it did not write.
- **`deep`**: design, synthesis, and hard code changes.
- **`standard`**: normal code changes and parallel exploration.
- **`fast`**: mechanical edits and bulk reading.

## Default table

| Role | `claude-code` | `codex` | `cursor` | `pi` | `dsh` |
| --- | --- | --- | --- | --- | --- |
| `ultra` | `claude-opus-5-5`, high | `gpt-6.1-sol`, high | Grok 4.7, high | `openai/gpt-6.1-sol`, high | `deepseek-flash`, max |
| `deep` | `claude-opus-5-5`, medium | `gpt-6.1-sol`, medium | Grok 4.7, medium | `openai/gpt-6.1-sol`, medium | `deepseek-flash`, max |
| `standard` | `claude-opus-5-5`, low | `gpt-6-luna`, xhigh | Grok 4.7, low | `openai/gpt-6-luna`, xhigh | `deepseek-flash`, high |
| `fast` | `claude-sonnet-5-5`, medium | `gpt-6-luna`, high | `composer-2.5` | `openai/gpt-6-luna`, high | `deepseek-flash`, high |

The `pi` column uses the `codex` models, written as `provider/id` as pi expects. It works only when OpenAI access is configured in pi. Hermes has no column, because it cannot set a model per subagent. `/setup-polaris` writes a column that matches the models you have.

## Overrides

Two optional files override the default table. The first file that sets a role wins:

1. `.agents/polaris/models.md` in the project root.
2. `~/.agents/polaris/models.md` for every project.
3. The default table.

An override file sets only the roles it lists. In Claude Code, overrides are agent files instead (see **Applying a role in each harness**). Each harness has its own section. Each line is `- <role>: <model>, <effort>`, or `- <role>: inherit` to use the session's model. The effort is optional.

```markdown
# polaris model overrides

## cursor
- fast: inherit

## codex
- standard: gpt-6-astra, medium

## pi
- deep: anthropic/claude-opus-5-5, high

## dsh
- fast: inherit
```

Read both override files, if they exist, before you start the first subagent of a task.

## Applying a role in each harness

Identify the harness from your system prompt and tools. If you cannot tell, treat every role as `inherit`.

- **`claude-code`**: a spawn can set its model but not its effort, so polaris ships one agent per role that sets both. Start the subagent with the agent type for its role:
  - If an override agent `polaris-<role>` exists in `.claude/agents/` or `~/.claude/agents/`, use it. `/setup-polaris` writes these files for Claude Code instead of an override line.
  - Otherwise use the plugin's agent `polaris:<role>`, for example `polaris:deep`.
  - For `inherit`, use the general-purpose agent with no model.
- **`codex`**: set `fork_turns` to `"none"` and pass `model` and `reasoning_effort`. A subagent that copies the conversation (`fork_turns` omitted or `"all"`) keeps the session's model and effort and ignores both. The subagent starts empty, so put everything it needs in its prompt.
- **`cursor`**: pass the model slug. The slug carries the effort, for example a Grok 4.7 slug that ends in `xhigh`. Use the exact slug that the spawn tool accepts.
- **`pi`**: pi has no subagent tool of its own, but an installed extension can add one. If the session has one, pass the model and the thinking level in the form its parameters accept. If it has none, use the no-subagent fallback.
- **`dsh`**: pass `model` and `reasoning_effort`, with the `provider` that `list_subagent_models` reports for the model. The subagent tool has these fields only when the session's agent preset asks for them and subagent model selection is turned on in the profile. The default `standard` preset asks for them. If the tool lacks them, use the fallback for a harness that cannot set a model per subagent.
- **`hermes`**: a spawn cannot set its model or effort. Every subagent uses `delegation.model` and `delegation.reasoning_effort` from `~/.hermes/config.yaml`, or the session's model and effort when they are unset. Roles do not apply.

## Fallbacks

- **The harness cannot set effort per subagent:** use the role's model at the harness's default effort.
- **The harness cannot set a model per subagent:** the subagent inherits the session model.
- **The harness has no subagents:** do the step yourself as a separate pass. Re-read your own output before you judge it, because the independence is lost.
- **The tool rejects the model:** use the session model.

Say which fallback you used, once, in your reply.
