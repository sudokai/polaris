# Writing playbooks

## Format

Each bundled playbook is one Markdown file in the parent directory, named after the task in kebab case with a `.md` extension. It has these parts, in this order:

1. **Title.** An H1 that names the task.
2. **Ownership line.** One bold sentence that says what the agent owns and what it does not. For example: **You own the resume point. Read the prior trail, don't redo it.**
3. **Scope.** State when the playbook applies and which playbook or skill to use instead in nearby cases.
4. **Steps.** A numbered list. Each step has one main action and names the skill or principle it uses, for example `principle-prove-it-works` or `how`. Resolve names using the conventions in the `polaris` skill.
5. **Reply line.** A paragraph that starts with `**Reply:**` and lists what the final reply must contain.

Add the playbook to the playbook index in [polaris](../../SKILL.md), with one line that says when it applies. A playbook missing from the index never runs.

A playbook designed by `figure-it-out` stays with the task's working files and needs no bundled index entry. Use the same format and the execution rules in [Playbooks](../README.md). Resolve references to installed skills and supporting files to absolute paths before saving the local playbook.

## Writing for agents

Playbooks, skills, and principles are read by agents, cold and mid-task. Every sentence becomes an instruction that some future agent follows. Hold them to these rules:

- **Keep only text that changes a decision.** If removing a sentence would not change what the agent does, remove it.
- **Say what to do.** Skip the reason unless the rule is confusing without one.
- **Point, don't restate.** Refer to skills and principles by name, and supporting files by path, instead of copying their content. Copies drift apart.
- **Prefer structure to prose.** When a rule can be a script, a type, a lint, or a check, write that instead and point at it.
- **Name things exactly.** Use the real command, path, and file name, not a description of it.
- **Match the scope.** A narrow task gets a short playbook. Do not add sections for symmetry.
- **When in doubt, delete.**
