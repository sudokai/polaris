# Playbooks

A playbook defines the task's sequence, handoffs, checks, and delivery. Skills provide the methods and outputs; principles guide decisions. Use these rules for both reusable playbooks and those designed for one task.

## Running a playbook

1. Open the matched playbook file.
2. Copy its numbered steps verbatim into the todo list before adding task details. Put nested playbook steps under the current step, then return to the caller.
3. Run applicable steps; mark skipped ones with `skip: <reason>`. Keep the work proportional to the task. Small changes need no new design or unrelated investigation. For code changes, follow **Executing implementation steps**.
4. Pass each skill the goal, constraints, findings, file paths, and checks already run. Reuse valid evidence; repeat checks when changes to the code, environment, or claim invalidate it.
5. Follow the playbook's `Reply:` line. A nested playbook returns its result to the caller for the overall reply.

## Executing implementation steps

Start `decision-log` (`../../decision-log/SKILL.md`) at the light level. Use the full level for unattended runs and playbooks designed by `figure-it-out`. Log decisions as you work.

Implement one unit at a time per [Sequence Work into Verifiable Units](../../principle-sequence-verifiable-units/SKILL.md): state the expected result, make the change, and check the actual result before proceeding. Preserve unrelated work when undoing a failed attempt. Investigate failed checks rather than weakening them. For migrations, declare temporary breakage and checks at phase boundaries per [Outcome-Oriented Execution](../../principle-outcome-oriented-execution/SKILL.md).

Review delegated output yourself. A worker's self-report does not replace required independent review.

## Finish implementation

When a playbook calls this section, run `deslop` (`../../deslop/SKILL.md`), then `sweep-residue` (`../../sweep-residue/SKILL.md`). If cleanup changes the result, rerun affected checks and update the evidence. Review the decision log and supersede outdated rows as `decision-log` requires.

Deliver the requested result with verification evidence and limits. Use `visual-pr` (`../../visual-pr/SKILL.md`) when the task includes creating or updating a PR. A playbook grants no additional permission to publish, deploy, or expand scope.

## Format

Each playbook is one Markdown file in this directory, named after the task in kebab case (for example `set-up-verification.md`). It has these parts, in this order:

1. **Title.** An H1 that names the task.
2. **Ownership line.** One bold sentence that says what the agent owns and what it does not. For example: **You own the resume point. Read the prior trail, don't redo it.**
3. **Scope.** State when the playbook applies and which playbook or skill to use instead in nearby cases.
4. **Steps.** A numbered list. Each step has one main action and names the skill or principle it uses by path, for example `../../principle-prove-it-works/SKILL.md` or the `how` skill (`../../how/SKILL.md`).
5. **Reply line.** A paragraph that starts with `**Reply:**` and lists what the final reply must contain.

Add the playbook to the playbook index in `../SKILL.md`, with one line that says when it applies. A playbook missing from the index never runs.

A playbook designed by `figure-it-out` stays with the task's working files and needs no bundled index entry. Use the same format and execution rules. Make links resolve from the saved file; use absolute skill paths when necessary.

## Writing for agents

Playbooks, skills, and principles are read by agents, cold and mid-task. Every sentence becomes an instruction that some future agent follows. Hold them to these rules:

- **Keep only text that changes a decision.** If removing a sentence would not change what the agent does, remove it.
- **Say what to do.** Skip the reason unless the rule is confusing without one.
- **Point, don't restate.** Refer to another skill, principle, or file by path instead of copying its content. Copies drift apart.
- **Prefer structure to prose.** When a rule can be a script, a type, a lint, or a check, write that instead and point at it (`../../principle-encode-lessons-in-structure/SKILL.md`).
- **Name things exactly.** Use the real command, path, and file name, not a description of it.
- **Match the scope.** A narrow task gets a short playbook. Do not add sections for symmetry.
- **When in doubt, delete.**
