# Playbooks

A playbook defines the task's sequence, handoffs, checks, and delivery. Skills provide the methods and outputs; principles guide decisions. Use these rules for both reusable playbooks and those designed for one task.

## Running a playbook

1. Open the matched playbook file.
2. Copy its numbered steps verbatim into the todo list before adding task details. Put nested playbook steps under the current step, then return to the caller.
3. Run applicable steps; mark skipped ones with `skip: <reason>`. Keep the work proportional to the task. Small changes need no new design or unrelated investigation.
4. Pass each skill the goal, constraints, findings, file paths, and checks already run. Reuse valid evidence; repeat checks when changes to the code, environment, or claim invalidate it.
5. Follow the playbook's `Reply:` line. A nested playbook returns its result to the caller for the overall reply.

## Format

A playbook is one Markdown file named after the task in kebab case. It has these parts, in this order:

1. **Title.** An H1 that names the task.
2. **Goal line.** One bold sentence that states the playbook's goal.
3. **Steps.** A numbered list. Each step has one main action and names the skill or principle it uses.
4. **Reply line.** A paragraph that starts with `**Reply:**` and lists what the final reply must contain.

A bundled playbook also needs a line in the router's playbook index, or it never runs. A local playbook never replaces a bundled one: if the names clash, run the bundled playbook and tell the user to rename the local file. Playbooks outside the plugin name skills and principles instead of linking them by path.
