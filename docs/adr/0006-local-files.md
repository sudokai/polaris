# Local files live under `.agents/polaris/`

polaris keeps everything it writes outside the plugin in one directory per scope: `<project>/.agents/polaris/` and `~/.agents/polaris/`. Model settings, local playbooks, the backlog, and resume notes then survive plugin updates, and the two scopes share one layout. `skills/polaris/references/locations.md` is the full contract.

## Decisions within this contract

- **Local playbooks add to the bundled ones and never replace them.** A project playbook replaces a user playbook with the same file name. A local playbook with a bundled playbook's file name does not run ([ADR 0011](0011-no-local-overrides-of-bundled-skills.md)).
- **New standalone skills go to the harness skill directories, not under `.agents/polaris/`.** They are the user's own skills, so they live where the harness finds them.
- **The project root is the current worktree's top level.** Two worktrees on different tasks keep separate resume notes.

## Consequences

- Everything under `.agents/polaris/` is committed except `resume/`. Resume notes are personal and excluded through `.git/info/exclude`. The backlog is shared and committed.
