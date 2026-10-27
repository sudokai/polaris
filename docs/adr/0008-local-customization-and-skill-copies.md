# Local customization and skill copies

Local additions live outside the installed plugin so updates preserve them. Shared project settings belong to the project; user model settings belong to the current harness's configuration directory. User local playbooks remain shared across harnesses. The [locations contract](../../skills/polaris/references/locations.md) owns the paths and scope rules.

Local playbooks add to bundled playbooks and cannot replace them. A project playbook takes precedence over a user playbook with the same filename. Standalone skills live in the harness's skill directories. The project root is the current worktree's top level so separate worktrees keep separate task state. Files under the project polaris root are committed except personal resume notes; the backlog contains shared, approved fixes deferred by the user.

A lesson never edits a skill inside an installed plugin, because the next update overwrites the edit. A lesson about an installed skill, from polaris or from another plugin, goes into a copy of it. `reflect` shows the destination before approval: the same skill name in the project or user skill directory. After approval, it copies the whole skill folder there and edits the copy. It never opens a PR or pushes. A defect that every polaris user would hit is still also shown as a proposal against polaris's source repository, and not applied.

A copy takes effect at once and survives updates, but it stops receiving updates to that skill. The user accepts this when they approve the destination. Routing every lesson about a bundled skill through instruction lines or upstream proposals was rejected: an instruction line cannot change a skill's method, and a proposal leaves the user without the fix until a release ships it.

This follows pstack commit `7054003` ("route reflect edits out of the plugin cache"), which applies the same rule to every skill in the plugin cache.
