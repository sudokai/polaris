# Playbooks

A playbook is a fixed sequence of steps for one kind of task. It names the skills and principles each step uses. The `polaris` router matches a task to a playbook, copies the playbook's steps into the todo list, and runs them.

## Running a playbook

1. Open the matched playbook file.
2. Copy its numbered steps into the todo list, verbatim, before any task-specific items.
3. Run each step. If you choose not to do a step, keep it in the list with `skip: <reason>`.
4. End with the reply that the playbook's `Reply:` line describes.

## Format

Each playbook is one Markdown file in this directory, named after the task in kebab case (for example `set-up-verification.md`). It has these parts, in this order:

1. **Title.** An H1 that names the task.
2. **Ownership line.** One bold sentence that says what the agent owns and what it does not. For example: **You own the resume point. Read the prior trail, don't redo it.**
3. **Scope.** Optional. One short paragraph on when the playbook applies and which playbook or skill to use instead in nearby cases.
4. **Steps.** A numbered list. Each step has one main action and names the skill or principle it uses by path, for example `../../principle-prove-it-works/SKILL.md` or the `how` skill (`../../how/SKILL.md`).
5. **Reply line.** A paragraph that starts with `**Reply:**` and lists what the final reply must contain.

Add the playbook to the playbook index in `../SKILL.md`, with one line that says when it applies. A playbook missing from the index never runs.

## Writing for agents

Playbooks, skills, and principles are read by agents, cold and mid-task. Every sentence becomes an instruction that some future agent follows. Hold them to these rules:

- **Keep only text that changes a decision.** If removing a sentence would not change what the agent does, remove it.
- **Say what to do.** Skip the reason unless the rule is confusing without one.
- **Point, don't restate.** Refer to another skill, principle, or file by path instead of copying its content. Copies drift apart.
- **Prefer structure to prose.** When a rule can be a script, a type, a lint, or a check, write that instead and point at it (`../../principle-encode-lessons-in-structure/SKILL.md`).
- **Name things exactly.** Use the real command, path, and file name, not a description of it.
- **Match the scope.** A narrow task gets a short playbook. Do not add sections for symmetry.
- **When in doubt, delete.**
