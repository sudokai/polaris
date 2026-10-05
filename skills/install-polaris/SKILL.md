---
name: install-polaris
description: "Install or refresh the polaris plugin in every supported harness on this machine (Claude Code, Codex, Cursor, pi, Hermes), and add the router rule to their global instructions. Use for /install-polaris, \"install polaris everywhere\", or after changing the plugin."
disable-model-invocation: true
---

# Install polaris

This is the bundled `install-polaris` skill. Before you follow it, check whether `<project>/.agents/polaris/skills/install-polaris/SKILL.md` or `~/.agents/polaris/skills/install-polaris/SKILL.md` exists. If one does, follow the first that exists instead of this file, and resolve its references and scripts as `../polaris/references/locations.md` describes.

Install or refresh the plugin from its source repository, in each harness found on this machine. Use the repository's absolute path as `<repo>`: the directory that holds `plugin.json`. If the current directory is not that repository, ask the user for the path.

Run the steps for each harness that is present (`command -v <binary>`), and skip the others. Run `python3 <repo>/scripts/check_plugin.py` first, and stop if it fails.

## 1. Install the plugin

| Harness | Check if installed | Install | Refresh |
| --- | --- | --- | --- |
| `claude-code` | `claude plugin list` shows `polaris@polaris` | `claude plugin marketplace add <repo>`, then `claude plugin install polaris@polaris` | `claude plugin marketplace update polaris`, then `claude plugin update polaris@polaris`. The plugin is read from `<repo>`, so a new session or `/reload-plugins` picks up edits. |
| `codex` | `codex plugin list` shows `polaris@polaris` | `codex plugin marketplace add <repo>`, then `codex plugin add polaris@polaris` | `codex plugin add polaris@polaris`. It re-copies the plugin into Codex's cache. `codex plugin marketplace upgrade` fails for a local marketplace. |
| `cursor` | `~/.cursor/plugins/local/polaris` exists | `ln -sfn <repo> ~/.cursor/plugins/local/polaris` | Nothing: the link follows `<repo>`. |
| `pi` | `pi list` shows `<repo>` | `pi install <repo>` | Nothing: pi reads `<repo>`. |
| `hermes` | `hermes plugins list` shows `polaris` | `hermes plugins install file://<repo> --enable` | `hermes plugins install file://<repo> --force`. Hermes keeps its own copy. |

Cursor's plugin loading from `~/.cursor/plugins/local/` is unconfirmed. After linking, ask the user to restart Cursor and check that the polaris skills are listed. Report the step as unverified until they confirm.

## 2. Connect the shared instructions

Portable preferences, including the router rule, live once in `~/.agents/AGENTS.md`. Each harness's global instruction file, and how to share the file with it, are under **Global instruction files** in `../polaris/references/harnesses.md`. These are global files, so ask the user before each change, and never delete or overwrite content.

1. Make sure `~/.agents/AGENTS.md` contains this line. If the line is missing, append it. If the file is missing, create it with only this line.

   ```markdown
   - For nontrivial engineering tasks, apply the `polaris` skill.
   ```

2. For `claude-code`, `codex`, and `pi`, check the global instruction file:
   - If it is a symbolic link to `~/.agents/AGENTS.md`, it is connected.
   - If it does not exist, create the link.
   - If it is a regular file, keep it. Add the router line if it is missing. Show the lines of `~/.agents/AGENTS.md` that the file lacks, and add the ones the user approves.
3. For `hermes`, treat `~/.hermes/SOUL.md` as a regular file, and add lines to its list of rules if it has one.
4. For `cursor`, find the rule in `~/.cursor/rules/` that copies `~/.agents/AGENTS.md`. If it differs from the shared file, show the difference and refresh the copy only with approval. If no rule copies the shared file, create `agents.mdc` with `alwaysApply: true` frontmatter and a copy of the shared file.
5. Check each changed harness with the one-shot check in `../polaris/references/harnesses.md`. Report a connection as working only after its check passes.

## 3. Report

Give one line per harness: installed, refreshed, already current, skipped (not present), or unverified. Give the state of its instruction connection: connected and checked, changed and checked, unverified, or unsupported. Name each instruction file that changed, and each harness that needs a restart.
