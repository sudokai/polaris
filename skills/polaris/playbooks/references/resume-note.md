# Resume note

A resume note lets a cold-start agent resume one task. [Pause safely](../pause-safely.md) writes it, and [Session pickup](../session-pickup.md) selects it and closes it. It lives at `.agents/polaris/resume/<slug>.md` in the project root, kept out of git. The slug is a short kebab-case task name, such as `fix-photo-loading`.

## Header

Start the note with these fields, one per line:

```markdown
task: <one line that names the task>
branch: <current branch>
worktree: <absolute path of the project root>
updated: <ISO 8601 timestamp>
status: in-progress
playbook: <each running playbook and its current step, outermost first, separated by " > ">
decision-log: <path of the task's decision log, or none>
```

Name a bundled playbook by its title, such as `Session pickup, step 5`, and a designed playbook by its path, such as `docs/migrate-auth-playbook.md, step 3`.

## Status

- `in-progress`: set by Pause safely. Pausing the same task again updates its note instead of writing a new one.
- `done`: set by Session pickup when the resumed task finishes.
- `abandoned`: set when the user drops the task or another task replaces it.

Session pickup selects only `in-progress` notes. Update `updated` with every change to the note.

## Body

After the header, write the intent, the progress and what is verified, the current state, the next steps, the key files, and gotchas. Point at the decision log instead of repeating it.
