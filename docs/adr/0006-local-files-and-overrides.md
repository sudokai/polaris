# Local files and overrides live under `.agents/polaris/`

polaris keeps everything it writes outside the plugin in one directory per scope: `<project>/.agents/polaris/` and `~/.agents/polaris/`. Learned workflows and model settings then survive plugin updates, and the two scopes share one layout. `skills/polaris/references/locations.md` is the full contract.

The effective skill is the project override, else the user override, else the bundled skill. This applies to router triggers, skill-to-skill calls, playbook steps, subagent briefs, and slash commands typed directly.

## Decisions within this contract

- **Overrides go in `.agents/polaris/skills/<name>/`, not `.agents/skills/<name>/`.** `~/.agents/skills/` is the user's shared skill library and is linked into harness skill directories, so an override there would appear as a second skill with the same name. New standalone skills still go to the harness skill directories.
- **Each bundled `SKILL.md` starts with a line that tells the agent to check for an override, and `scripts/check_plugin.py` enforces it.** A slash command or a call from one skill to another never passes through the router, so router-only wording would miss them. A resolver script was rejected because it needs a runtime on every harness.
- **An override replaces the bundled skill completely and is never merged.** It records what it replaced (`overrides: polaris <version> skills/<name>`), so the agent can warn when the bundled skill is newer. Silent merges would mix instructions nobody reviewed.
- **A relative path in an override resolves from the override's directory first, then from the bundled skill's directory.** An override can replace one reference and still reach the rest, instead of copying files that go stale with each plugin update.
- **An unreadable or malformed override stops the agent.** Falling back to the bundled skill would hide that the user's change is not running.
- **A local playbook with the same file name replaces the lower-scope one.** Project replaces user, and either replaces bundled. Running both would give conflicting steps.
- **The project root is the current worktree's top level.** Two worktrees on different tasks keep separate resume notes.

## Consequences

- Everything under `.agents/polaris/` is committed except `resume/`. Resume notes are personal and excluded through `.git/info/exclude`. The backlog is shared and committed.
- No migration code exists for the earlier roots `.polaris/` and `~/.config/polaris/`. Neither had been created anywhere when the roots changed, one day after the plugin was first built.
