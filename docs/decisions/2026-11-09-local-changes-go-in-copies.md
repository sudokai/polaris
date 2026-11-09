---
status: accepted
created: 2026-11-09
---

# Local changes go in local playbooks and skill copies

Local additions live outside the installed plugin, because a plugin update overwrites edits made inside it. Local playbooks in `.agents/polaris/playbooks/`, in the project or in `~`, add to the bundled playbooks and never replace them. A project playbook replaces a user playbook with the same file name.

A lesson about an installed skill, from polaris or from another plugin, goes into a copy of that skill. `self-improve` asks before changing anything. After approval, it copies the whole skill folder to the same name in the project or user skill directory, and edits the copy.

A copy takes effect at once and survives updates, but it stops receiving updates to that skill. The user accepts this when approving the change. Two alternatives were rejected. An instruction line cannot change a skill's method. A proposal to the plugin's source repository leaves the user without the fix until a release ships it.
