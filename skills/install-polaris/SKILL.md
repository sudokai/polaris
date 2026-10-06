---
name: install-polaris
description: "Install or refresh the polaris plugin in every supported harness on this machine (Claude Code, Codex, Cursor, pi, Hermes). Use for /install-polaris, \"install polaris everywhere\", or after changing the plugin."
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
| `cursor` | `~/.cursor/plugins/local/polaris` exists | Run the Cursor copy command below | Run the same command to refresh the copy. |
| `pi` | `pi list` shows `<repo>` | `pi install <repo>` | Nothing: pi reads `<repo>`. |
| `hermes` | `hermes plugins list` shows `polaris` | `hermes plugins install file://<repo> --enable` | `hermes plugins install file://<repo> --force`. Hermes keeps its own copy. |

Cursor rejects local-plugin symbolic links whose targets resolve outside `~/.cursor/plugins/local/`. Set `repo` to the absolute source path, then run this command for both install and refresh:

```sh
repo="/absolute/path/to/polaris"
destination="$HOME/.cursor/plugins/local/polaris"
mkdir -p "$(dirname "$destination")"
if [ -L "$destination" ]; then
  rm "$destination"
fi
rsync -a --delete --exclude='.git/' "$repo/" "$destination/"
```

After copying, ask the user to restart Cursor and check that the polaris skills are listed. Report Cursor loading as unverified until they confirm.

## 2. Check global instructions

Each harness's global instruction file and its one-shot check are under **Global instruction files** in `../polaris/references/harnesses.md`.

For each installed harness, report whether its global instruction file exists. Run the harness's check only when the user asks.

## 3. Report

Give one line per harness: installed, refreshed, already current, skipped (not present), or unverified. Say whether its global instruction file exists, and give the check result if you ran one. Name each harness that needs a restart.
