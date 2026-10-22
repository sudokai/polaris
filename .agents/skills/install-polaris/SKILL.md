---
name: install-polaris
description: "Install or refresh the polaris plugin in every supported harness on this machine (Claude Code, Codex, Grok Build, Cursor, pi, Hermes, DeepSeek Harness). Use for /install-polaris, \"install polaris everywhere\", or after changing the plugin."
disable-model-invocation: true
---

# Install polaris

Install or refresh the plugin from this repository, in each harness found on this machine. Use the repository root's absolute path as `<repo>`.

Run the steps for each harness that is present (`command -v <binary>`), and skip the others. Run `python3 <repo>/scripts/check_plugin.py` first, and stop if it fails.

## 1. Install the plugin

| Harness | Check if installed | Install | Refresh |
| --- | --- | --- | --- |
| `claude-code` | `claude plugin list` shows `polaris@polaris` | `claude plugin marketplace add <repo>`, then `claude plugin install polaris@polaris` | `claude plugin marketplace update polaris`, then `claude plugin update polaris@polaris`. The plugin is read from `<repo>`, so a new session or `/reload-plugins` picks up edits. |
| `codex` | `codex plugin list` shows `polaris@polaris` | `codex plugin marketplace add <repo>`, then `codex plugin add polaris@polaris` | `codex plugin add polaris@polaris`. It re-copies the plugin into Codex's cache. `codex plugin marketplace upgrade` fails for a local marketplace. |
| `grok-build` | `grok plugin list` shows `polaris` | `grok plugin install <repo> --trust` | `grok plugin uninstall polaris --confirm`, then the install command again. Grok copies the plugin at install time, and `grok plugin update` leaves that copy unchanged. Start a new session after installing. |
| `cursor` | `~/.cursor/plugins/local/polaris` exists | Run the Cursor copy command below | Run the same command to refresh the copy. |
| `pi` | `pi list` shows `<repo>` | `pi install <repo>` | Nothing: pi reads `<repo>`. |
| `hermes` | `skills.external_dirs` contains `<repo>/skills`, and `hermes plugins list --user --json` does not list `polaris` | Run the Hermes command below | Run the same command. |
| `dsh` | `~/.dsh/profiles/<profile>/package.json` lists `polaris` under `dsh.profile.bundles`, for each profile in `~/.dsh/profiles/` | `dsh plugin --profile <profile> add <repo>` for each profile | Nothing: the profile links `<repo>`. |

Do not install polaris with `hermes plugins install`. That registers each skill as `agent-plugin-polaris-<hash>:<skill>`. Add `<repo>/skills` to `skills.external_dirs`, and remove a `polaris` plugin install if one exists. Hermes reads that directory. Start a new session after the command.

Set `repo` to `<repo>`, then run:

```sh
repo="/absolute/path/to/polaris"
skills_dir="$(cd "$repo/skills" && pwd)"
python3 - "$skills_dir" <<'PY'
import json
import subprocess
import sys
from pathlib import Path

skills_dir = Path(sys.argv[1]).resolve()
listed = subprocess.run(
    ["hermes", "plugins", "list", "--user", "--json"],
    check=True,
    capture_output=True,
    text=True,
)
plugins = json.loads(listed.stdout)
if any(item.get("name") == "polaris" for item in plugins):
    subprocess.check_call(["hermes", "plugins", "remove", "polaris"])

got = subprocess.run(
    ["hermes", "config", "get", "skills.external_dirs", "--json"],
    capture_output=True,
    text=True,
)
if got.returncode:
    if "Config key not set" not in got.stderr:
        raise SystemExit(got.stderr.strip() or "could not read skills.external_dirs")
    dirs = []
else:
    dirs = json.loads(got.stdout or "[]")
if not isinstance(dirs, list):
    raise SystemExit("skills.external_dirs is not a list")

if not any(
    isinstance(entry, str) and Path(entry).expanduser().resolve() == skills_dir
    for entry in dirs
):
    dirs.append(str(skills_dir))
    subprocess.check_call(
        ["hermes", "config", "set", "skills.external_dirs", json.dumps(dirs)]
    )
PY
```

Cursor rejects local-plugin symbolic links whose targets resolve outside `~/.cursor/plugins/local/`. Run this command, with `repo` set to `<repo>`, for both install and refresh:

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

The repository is a dsh bundle: `cordis.patch.yml` adds its `skills/` directory to the profile. dsh installs bundles per profile, including the desktop app's profile. Ask the user to start a new session in each profile and check that the `polaris` skill is listed. Report dsh loading as unverified until they confirm.

## 2. Report

Give one line per harness: installed, refreshed, already current, skipped (not present), or unverified. Name each harness that needs a restart.
