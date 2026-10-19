# Installing in each harness

Each harness installs the plugin a different way, and several obvious approaches fail. `README.md` has the commands; these are the constraints behind them.

- **Claude Code and Codex use the repository as its own marketplace** (`.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json`). Both install plugins only from a marketplace, and a marketplace in a temporary directory would disappear. Claude Code reads the plugin from the repository. Codex copies it into its plugin cache, so it needs a reinstall after changes.
- **Grok Build installs by path with `--trust`, not from a marketplace.** A Grok marketplace plugin must be in a subdirectory, and `source: "./"` is refused. A `plugins/polaris` symlink to the root installs once, then `grok plugin update` fails with a symlink loop. Grok copies the plugin and `grok plugin update` leaves the copy unchanged, so a refresh is uninstall, install, and a new session.
- **`dsh` installs the repository as a bundle.** `package.json` declares `dsh.bundle.patch`, and `cordis.patch.yml` adds the plugin's `skills/` directory to the skill loader. Linking skills into `~/.dsh/skills/` and patching profiles were both tried and replaced: the desktop profile cannot be patched from the command line, and a bundle installs like a plugin in every profile.
- **`install-polaris` is a repository skill**, in `.agents/skills/install-polaris/` with a `.claude/skills/` link. It installs polaris into the user's harnesses, so it is a tool for this repository, not part of the plugin.
- **A rename is uninstall plus install** in every harness, because a refresh keeps the old plugin name.
