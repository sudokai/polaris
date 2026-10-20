# Playbooks

A playbook defines the task's sequence, handoffs, checks, and delivery. Skills provide the methods and outputs; principles guide decisions. Use these rules for both reusable playbooks and those designed for one task.

## Running a playbook

1. Open the matched playbook file.
2. Copy its numbered steps verbatim into the todo list before adding task details. Put nested playbook steps under the current step, then return to the caller.
3. Run applicable steps; mark skipped ones with `skip: <reason>`. Keep the work proportional to the task. Small changes need no new design or unrelated investigation. For code changes, follow [implementation rules](references/executing-implementation-steps.md).
4. Pass each skill the goal, constraints, findings, file paths, and checks already run. Reuse valid evidence; repeat checks when changes to the code, environment, or claim invalidate it.
5. Follow the playbook's `Reply:` line. A nested playbook returns its result to the caller for the overall reply.

## Supporting instructions

- [Implementation rules](references/executing-implementation-steps.md) define how to implement and check each unit.
- [Completion rules](references/finish-implementation.md) define cleanup and delivery.
- [Playbook authoring](references/writing-playbooks.md) defines the playbook format and writing rules.
