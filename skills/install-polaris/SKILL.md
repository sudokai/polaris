---
name: install-polaris
description: "Install or refresh the polaris plugin in every supported harness on this machine (Claude Code, Codex, Cursor, pi, Hermes), and add the router rule to their global instructions. Use for /install-polaris, \"install polaris everywhere\", or after changing the plugin."
disable-model-invocation: true
---

# Install polaris

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

## 2. Add the router rule

Add this line to each global instruction file that exists:

```markdown
- For nontrivial engineering tasks, apply the `polaris` skill.
```

| Harness | File | Where the line goes |
| --- | --- | --- |
| `claude-code` | `~/.agents/AGENTS.md`, which `~/.claude/AGENTS.md` links to | End of the list |
| `cursor` | `~/.cursor/rules/agents.mdc` | End of the file, after its frontmatter |
| `hermes` | `~/.hermes/SOUL.md` | End of the Global Rules list |

Codex and pi are not listed. Their global instruction paths are unconfirmed, so do not guess one.

For each file:

1. Skip it if it already contains the line.
2. Skip it if it does not exist. Do not create it.
3. Ask the user before editing it, because these are global instructions.
4. Append only that line. Leave every other rule unchanged, even when it differs from the other files.

## 3. Report

Give one line per harness: installed, refreshed, already current, skipped (not present), or unverified. Name each instruction file that changed, and each harness that needs a restart.
