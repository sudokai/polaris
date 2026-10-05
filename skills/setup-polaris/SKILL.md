---
name: setup-polaris
description: "Choose which model and effort each polaris role (ultra, deep, standard, fast) uses in this harness, and write an override for this project or for every project. Use for /setup-polaris, \"configure polaris models\", or changing polaris's model choices."
disable-model-invocation: true
---

# Setup polaris

Write an override for polaris's role table. The default table, the override format, and the precedence order are in `../polaris/references/models.md`. Read that file first.

## 1. Identify the harness

Identify the harness from your system prompt and tools: `claude-code`, `codex`, `cursor`, `pi`, or `hermes`. If it is none of these, say so and stop. polaris has no column for it.

If the harness is `pi` and the session has no subagent tool, tell the user that roles apply only when an installed pi extension adds one, and stop. If it is `hermes`, tell the user that a spawn cannot choose its model or effort, so roles do not apply. Every subagent uses `delegation.model` and `delegation.reasoning_effort` from `~/.hermes/config.yaml`, or the session's model and effort when they are unset. Stop.

## 2. Detect the available models

List the models and effort levels that this harness can give a subagent. Use the dependable source for the harness:

- **`claude-code`**: the model values that the subagent spawn tool accepts, and the effort levels `low`, `medium`, `high`, `xhigh`, and `max`.
- **`codex`**: `~/.codex/models_cache.json`, which lists each model and its supported reasoning efforts.
- **`cursor`**: the model slugs that the subagent spawn tool accepts.
- **`pi`**: `pi --list-models`, which lists each available `provider/id`, and the thinking levels `off`, `minimal`, `low`, `medium`, `high`, `xhigh`, and `max`. pi lowers a level that the model does not support. Check that the subagent tool accepts a model and a thinking level. If it accepts neither, say so and stop.

If you cannot detect them, ask the user to paste the models they can use. Never write a model you have not confirmed is available. `inherit` is always valid. It means the role runs on the session's model.

## 3. Show the current table

Build the current table for this harness: the default column, overridden by `~/.config/polaris/models.md`, then by `.polaris/models.md`. For Claude Code, the overrides are the agent files described in step 5. Show each role with its model and effort, and mark any model that is not in the detected set as needing a choice.

## 4. Ask what to change

Ask which roles to change. Offer the detected models, their effort levels, and `inherit`. Then ask where to save:

- **This project**: `.polaris/models.md`, or `.claude/agents/` in Claude Code.
- **Every project**: `~/.config/polaris/models.md`, or `~/.claude/agents/` in Claude Code.

Use the harness's question tool when it has one. Otherwise, ask in plain text.

## 5. Write the override

Write only the roles the user changed. Every other role keeps falling through to the next level.

- **`codex`**, **`cursor`**, or **`pi`**: rewrite the whole override file in the format from `../polaris/references/models.md`. Keep the other harnesses' sections in the file unchanged. Remove a role line when the user sets it back to the default.
- **`claude-code`**: a spawn cannot set effort, so write one agent file per changed role, named `polaris-<role>.md`, in the chosen agents directory:

  ```markdown
  ---
  name: polaris-<role>
  description: "polaris's `<role>` role override. Use only when an polaris skill or playbook assigns work to the `<role>` role."
  model: <model>
  effort: <effort>
  ---

  You are a subagent started by polaris for the `<role>` role. Follow the brief you were given. If the brief tells you to read the `polaris` skill first, do that before any other work.
  ```

  For `inherit`, write `model: inherit` and omit `effort`. Delete the file when the user sets the role back to the default.

Overwrite each file in full, so that running this skill again with the same answers produces identical files.

## 6. Confirm

Read back what you wrote. Tell the user that the change applies to subagents started from now on, and that Claude Code loads new agent files in a new session.

**Reply:** the harness, the final table with the source of each role (default, user, or project), and the paths you wrote or deleted.
