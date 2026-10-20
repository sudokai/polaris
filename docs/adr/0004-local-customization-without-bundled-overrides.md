# Local customization without bundled overrides

Local additions live outside the installed plugin so updates preserve them. Shared project settings belong to the project; user model settings belong to the current harness's configuration directory. User local playbooks remain shared across harnesses. The [locations contract](../../skills/polaris/references/locations.md) owns the paths and scope rules.

Local playbooks add to bundled playbooks and cannot replace them. A project playbook takes precedence over a user playbook with the same filename. Standalone skills live in the harness's skill directories. The project root is the current worktree's top level so separate worktrees keep separate task state. Files under the project polaris root are committed except personal resume notes; the backlog contains shared, approved fixes deferred by the user.

Lessons never edit an installed plugin or create local copies of bundled methods. A project or user instruction can name the bundled capability and explain the needed adaptation. A defect affecting all users becomes a proposal against the plugin's source repository, shown for approval rather than applied by the learning flow.

Full-copy overrides were rejected because they stop receiving updates and require override selection at every call. They also need relative-path fallbacks, version checks, and malformed-copy handling. Local instructions and additive playbooks express adaptations without maintaining a fork of each bundled method.
