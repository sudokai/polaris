# Lessons never edit the bundled plugin

`reflect` records lessons in overrides, local playbooks, trigger lines, and instruction files, never in the bundled skills, playbooks, principles, or index. An installed plugin copy is overwritten on update, and the plugin holds method shared by every user. A defect that every polaris user would hit becomes an upstream proposal: the agent drafts it against the plugin's source repository, shows it, and does not apply it.

## Consequences

- Personal preferences go to the user's instruction file, never into polaris. A preference goes to `~/.agents/AGENTS.md` only when the evidence spans two or more projects; otherwise it goes to the project's agent instruction file.
- Portable preferences are written once to `~/.agents/AGENTS.md`, and each harness's global instruction file connects to it. Each connection was checked with a one-shot run of that harness, because the files that harnesses load differ and are easy to assume wrongly.
- Principles have no override yet. Personal rules go to instruction files, and principle defects go upstream.
