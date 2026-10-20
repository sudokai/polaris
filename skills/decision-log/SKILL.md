---
name: decision-log
description: "Keep a decision log while you implement: one TSV row per decision or deviation from the plan, with the reason and evidence. Light by default. The full level adds a transcript audit and a review by another model. Use when starting an implementation that follows a plan or spec, for /decision-log, and for unattended or multi-phase runs that someone reviews later."
---

# Decision log

Keep one canonical log while you implement.

## Levels

- **Light**, the default: keep the log, follow **When to log**, and do **Wrap up**.
- **Full**: also do **Audit the log against the transcript** and **Cross-model review of the trail** before you hand back. Use it for unattended runs, for work that the `figure-it-out` skill (`../figure-it-out/SKILL.md`) designs, and when the user asks for an audit trail.

## When to log

When an edge case forces you off the plan, or the plan is silent or ambiguous and you must choose:

1. Pick the conservative option: safer, smaller in scope, reversible, and in line with existing patterns.
2. Log it. Use kind `deviation` when the plan said one thing and you did another, and say both in `why`. Use kind `decision` when the plan was silent.
3. Keep going. Stop to ask only when the choice is irreversible or has a large blast radius, such as data loss, a public API, or security.

Also log checkpoints: a unit completed with its verification result, a pivot or revert with its trigger, a blocker surfaced, a gate fixed. For loop runs, log one row per iteration. Draw unit boundaries per [Sequence Work into Verifiable Units](../principle-sequence-verifiable-units/SKILL.md), and phase boundaries in a planned rewrite or migration per [Outcome-Oriented Execution](../principle-outcome-oriented-execution/SKILL.md). Skip trivial choices, such as variable names or obvious error messages.

## The format

A single TSV file, one row per decision. Cells stay single-line. Evidence is a pointer, not prose.

Copy `references/decision-log-template.tsv` (the header row) to start a clean log. Columns:

- **ts.** ISO8601 timestamp.
- **phase.** The phase or workstream.
- **kind.** `decision` or `deviation`.
- **decision.** What was chosen or done, one line.
- **why.** The reason in plain words. If a principle drove it, say it plainly, not as a jargon tag.
- **evidence.** A link or path that proves it: commit SHA, PR number, `file:line`, or an artifact, trace, or screenshot path. Never a paragraph.
- **result.** The outcome or predicate state: `tests green`, `reverted`, `pixel-diff 0`, `INCONCLUSIVE`, `open`.

An example, plain-spoken so a reviewer reads it at a glance.

```
ts	phase	kind	decision	why	evidence	result
2026-05-24T09:02:00Z	frame	decision	counted the work first, about 100 components and roughly 75 hours	wanted to know the size before starting a long run	commit 3a9f1c2	found 5 things to sort out before starting
2026-05-24T09:40:00Z	harness	decision	took screenshots of the old version before changing anything	so we can compare old against new and catch any visual change	scripts/snapshot.sh, baseline/	saved 120 reference screenshots
2026-05-24T11:15:00Z	widget	decision	moved the widget styles over without changing how it looks	keep the change small and the result identical	commit 7c21e0a, pixel-diff 0	looks identical, tests pass
2026-05-24T12:30:00Z	widget	deviation	threw out a helper's work because its screenshots were blank	checked the real files instead of trusting its summary	worktree reset	reverted, tightened the instructions for next time
```

## Logging a row

Write each entry the way you'd tell a teammate what you did. Plain words, concrete actions, no AI speak or abstract jargon.

Use the helper `scripts/log.sh <logfile> <phase> <kind> <decision> <why> <evidence> <result>`. It stamps `ts`, writes the header on first use, strips stray tabs/newlines, and prefixes any cell starting with `=`, `+`, `-`, or `@` with a single quote. A bare `printf` appending a row works too, but mind those same bytes if cells come from generated or user-supplied text.

A run is one agent conversation, including its later turns and any summary of it. A pickup, a replacement agent, or a new chat starts a new run. When a run adds to a log that already has rows, its first row has phase `start`, and so does its first row after another run's `start` row. So a run that comes back to a log in a later turn first reads the log's last rows to see whether another run wrote since. A `start` row names the `ts` range of the rows before it that this run did not write, and its evidence names this run, such as its agent id. Use phase `start` for nothing else.

## Where it lives

By default the log is a working artifact, not committed. Keep it at `decisions.tsv` in the work dir, or `.audit/<task-slug>.tsv` when several efforts run at once, and leave it out of git.

Commit it only when the work is ambitious enough that a reviewer needs the trail to trust the result.

## Rules

- Append-only. A wrong call gets a new row that supersedes it. Never edit or delete history.
- Prefer evidence produced by committed scripts over hand-made one-offs ([Encode Lessons in Structure](../principle-encode-lessons-in-structure/SKILL.md)).

## Wrap up

At a natural stopping point, such as a pull request ready for review or a feature done, read the log once. For each row that no longer matches the final code, add a row that supersedes it.

## Audit the log against the transcript

Full level only.

At the end of the run, before handing back, check the log told the truth. Read this run's transcript. Find it with `../polaris/references/harnesses.md`, and read only this project's transcripts. Walk this run's rows against what actually happened. Each stretch of them begins at one of this run's `start` rows, or at the first row if this run created the log, and ends at the next `start` row of another run:

- Check that every row maps to a real decision or action.
- Check that each row's evidence resolves and shows what the row claims.
- A fork, pivot, or abandoned approach that shaped the work but isn't logged is a gap. Add it.

Correct the log, not the story. The audit never edits or removes a row, even an invented one. When a row records neither a real decision nor a real action, or its claim or evidence is wrong, add a row that supersedes it with what actually happened and a pointer that resolves. This audit does not check rows outside this run's stretches. If this run's own work shows one of them is wrong, supersede it like any wrong call.

## Cross-model review of the trail

Full level only.

Before handing back, spawn a subagent on a different model family from the one that did the work. Self-review is not a substitute. The subagent reads the audit trail and the run's transcript, then flags what the user should pay attention to. Not a redo of the work, a scan for what's suboptimal or risky.

- Decisions logged with weak or absent evidence.
- Verification steps skipped or claimed without proof in the transcript.
- Choices that look risky in hindsight (premature, scope-creeping, papering over a symptom).
- Gaps the user would otherwise miss on a casual skim.

Every reply for a full-level run ends with an "Attention" section. Lead with the reviewer's model on its own line (`reviewed by <model>`), then list each flag pointing to specific rows or moments. "No flags" is a valid value. The model name is not.

## Reviewing the trail

Read top to bottom, follow the evidence pointers, spot-check. GitHub renders a committed TSV as a table. `column -s$'\t' -t decisions.tsv` renders it in a terminal.

## Composing this skill

Other skills route their audit trail here instead of inventing one. Reference it by name and let it own the format. Don't restate the columns.
