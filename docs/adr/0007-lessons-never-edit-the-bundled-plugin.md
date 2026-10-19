# Lessons never edit the bundled plugin

`reflect` records lessons in local playbooks, standalone skills, trigger lines, and instruction files, never in the bundled skills, playbooks, principles, or index. An installed plugin copy is overwritten on update, and the plugin holds method shared by every user. A defect that every polaris user would hit becomes an upstream proposal: the agent drafts it against the plugin's source repository, shows it, and does not apply it.

## Consequences

- Personal preferences go to the user's instruction file, never into polaris. A preference goes to `~/.agents/AGENTS.md` only when the evidence spans two or more projects; otherwise it goes to the project's agent instruction file.
- A preference for every harness is written once to `~/.agents/AGENTS.md`. A preference for one harness goes to that harness's own global instruction file, listed in `skills/polaris/references/harnesses.md`. polaris does not link the harness files to `~/.agents/AGENTS.md`; the user's own setup does.
- A lesson about a polaris skill or playbook that holds only for one repository or one user becomes a line in an instruction file that names the skill and what to do differently ([ADR 0011](0011-no-local-overrides-of-bundled-skills.md)).
