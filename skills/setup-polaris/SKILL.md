---
name: setup-polaris
description: "Choose which model and effort each polaris role (ultra, deep, standard, fast) uses in this harness, and write an override for this project or for every project. Use for /setup-polaris, \"configure polaris models\", or changing polaris's model choices."
disable-model-invocation: true
---

# Setup polaris

Write an override for polaris's role table. The default table, the override format, and the precedence order are in `../polaris/references/models.md`. Read that file first.

## 1. Identify the harness

Identify the harness from your system prompt and tools: `claude-code`, `codex`, `cursor`, `pi`, `dsh`, `grok-build`, or `hermes`. If it is none of these, say so and stop. polaris has no column for it.

If the harness is `pi` and the session has no subagent tool, tell the user that roles apply only when an installed pi extension adds one, and stop. If the harness is `dsh` and the subagent tool has no `model` field, tell the user to turn on subagent model selection for the profile and allow the role models, then start a new session, and stop. Each profile has its own setting:

- **Desktop app:** open **Plugins** in the sidebar, then select **Subagent** in the Official group.
- **A command-line profile:** add an entry to `~/.dsh/profiles/<profile>/cordis.patch.yml`. Find the entry's `id` with `dsh --profile <profile> --dump-config`. It is the entry whose `name` is `@deepseek-ai/dsh-tool-subagent/model-selection-settings`. For example, in `dsh-tui`:

  ```yaml
  - id: dsh-tui-subagent-model-selection-settings
    config:
      enabled: true
      allowedModels:
        - provider: <provider>
          model: <model>
  ```

If the setting is on and the tool still has no `model` field, the session's agent preset does not ask for model selection. Tell the user that roles do not apply with that preset, and stop.

If the harness is `hermes`, tell the user that a spawn cannot choose its model or effort, so roles do not apply. Every subagent uses `delegation.model` and `delegation.reasoning_effort` from `~/.hermes/config.yaml`, or the session's model and effort when they are unset. Stop.

## 2. Detect the available models

List the models and effort levels that this harness can give a subagent. Use the dependable source for the harness:

- **`claude-code`**: the model values that the subagent spawn tool accepts, and the effort levels `low`, `medium`, `high`, `xhigh`, and `max`.
- **`codex`**: `~/.codex/models_cache.json`, which lists each model and its supported reasoning efforts.
- **`cursor`**: the model slugs that the subagent spawn tool accepts.
- **`grok-build`**: `grok models`, and the effort levels `low`, `medium`, `high`, and `xhigh`.
- **`pi`**: `pi --list-models`, which lists each available `provider/id`, and the thinking levels `off`, `minimal`, `low`, `medium`, `high`, `xhigh`, and `max`. pi lowers a level that the model does not support. Check that the subagent tool accepts a model and a thinking level. If it accepts neither, say so and stop.
- **`dsh`**: the `list_subagent_models` tool, which lists each allowed provider and model with its reasoning efforts.

If you cannot detect them, ask the user to paste the models they can use. Never write a model you have not confirmed is available. `inherit` is always valid. It means the role runs on the session's model.

## 3. Show the current table

Build the current table for this harness: the default column, overridden by `~/.agents/polaris/models.md`, then by `.agents/polaris/models.md`. For Claude Code and Grok Build, the overrides are the agent files described in step 5. Show each role with its model and effort, and mark any model that is not in the detected set as needing a choice.

## 4. Ask what to change

Ask which roles to change. Offer the detected models, their effort levels, and `inherit`. Then ask where to save:

- **This project**: `.agents/polaris/models.md`, `.claude/agents/` in Claude Code, or `.grok/agents/` in Grok Build.
- **Every project**: `~/.agents/polaris/models.md`, `~/.claude/agents/` in Claude Code, or `~/.grok/agents/` in Grok Build.

Use the harness's question tool when it has one. Otherwise, ask in plain text.

## 5. Write the override

Write only the roles the user changed. Every other role keeps falling through to the next level.

- **`codex`**, **`cursor`**, **`pi`**, or **`dsh`**: rewrite the whole override file in the format from `../polaris/references/models.md`. Keep the other harnesses' sections in the file unchanged. Remove a role line when the user sets it back to the default.
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

- **`grok-build`**: a spawn cannot set its model or effort, so write the same agent file as for Claude Code, in the chosen agents directory.

For a Claude Code or Grok Build agent file, `inherit` means `model: inherit` and no `effort`. Delete the file when the user sets the role back to the default.

Overwrite each file in full, so that running this skill again with the same answers produces identical files.

## 6. Confirm

Read back what you wrote. Tell the user that the change applies to subagents started from now on, and that Claude Code and Grok Build load new agent files in a new session.

**Reply:** the harness, the final table with the source of each role (default, user, or project), and the paths you wrote or deleted.
