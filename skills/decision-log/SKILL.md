---
name: decision-log
description: "Log significant decisions the agent makes when the user's instructions or an implementation plan are underspecified or unclear, and deviations forced by edge cases. Use one TSV row per entry, with its reason, evidence, and outcome."
---

Keep a structured log of the decisions you make and the deviations you take while implementing code. Write down each decision when you make it. Do not reconstruct decisions from memory after the work is finished.

Log only:

- **`decision`**: a significant choice you make on your own because the user's instructions or implementation plan are underspecified or unclear.
- **`deviation`**: an edge case that forces you to change the plan. Record the original plan, the edge case, and what you did instead.

Do not log routine work, progress updates, or choices the user or plan already made.

When the instructions or plan leave a choice open, choose the option that is safer, smaller, reversible, and consistent with the existing code. Log it and continue. Stop and ask the user only when the choice cannot be undone or has wide impact, such as data loss, a public API change, or a security change.

Save the log at the path the caller gives. Otherwise, save it as `decisions.tsv` in the working directory, or as `.audit/<task-name>.tsv` when several tasks need separate logs. Do not commit it unless the user asks.

Add each row with:

```sh
<absolute-skill-directory>/scripts/log.sh <logfile> <phase> <kind> <decision> <why> <evidence> <result> [supersedes]
```

Replace `<absolute-skill-directory>` with the full path to the directory containing this skill.

Use the script instead of writing rows by hand. It writes the header in a new log, adds the timestamp, and gives each row the next `id`, which it prints. It replaces tabs and line breaks with spaces so each entry occupies one row. If a cell starts with `=`, `+`, `-`, or `@`, it adds an apostrophe so spreadsheet software does not interpret the cell as a formula. [The template](references/decision-log-template.tsv) also contains the header.

Columns:

- `id`: The row's number in this log. The script assigns it.
- `ts`: The UTC timestamp. The script writes it in ISO 8601 format.
- `phase`: The part of the task that the decision applies to.
- `kind`: `decision` or `deviation`.
- `decision`: What you decided or did.
- `why`: What was unclear and why you made this choice. For a deviation, state the original plan, the edge case, and why you had to change the plan.
- `evidence`: Where to find the supporting evidence, such as `file:line`, a commit hash, or a saved test-output file. Point to the evidence instead of copying it into the log.
- `result`: The outcome, such as `tests passed`, `reverted`, or `INCONCLUSIVE`. Use `open` if you do not know the outcome yet.
- `supersedes`: The `id` of the row this one replaces, or empty. The script rejects an `id` that is not in the log.

Never edit or delete an existing row. To change a decision, correct an entry, or record the outcome of an `open` row, add a new row that explains the change, and pass the earlier row's `id` as `supersedes`.
