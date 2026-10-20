# Session pickup

**You own the resume point. Read the prior trail, don't redo it.**

Use this playbook to resume one specific piece of unfinished work. To catch up on a topic across many sessions, use the `recall` skill (`../../recall/SKILL.md`) instead.

1. Select the resume note (`../references/locations.md`):
   - If the user names a note or a path, use it.
   - Otherwise, read the header fields of each note in `.agents/polaris/resume/` whose `status` is not `done`. If the user named the task, keep the notes whose `task` matches it. Otherwise, keep the notes whose `branch` and `worktree` match the current ones.
   - If one note matches, use it. If several match, list each one's `task`, `branch`, and `updated`, and ask which to resume. Never choose by recency alone.
   - If none matches, use a pushed branch or a transcript instead. Find transcripts with `../references/harnesses.md`, and read only this project's transcripts unless the user points at another. Read the metadata and the last messages first, then scan back for the decision points. Parse a long transcript in a subagent for `kind: execution`, `level: regular` extraction, selected with `../references/models.md`, and keep only the reduced timeline in your context ([Guard the Context Window](../../principle-guard-the-context-window/SKILL.md)).
2. Reconstruct the operational state: the branch and worktree, what already landed (`git log`, and `git diff` against the base), the open todos, and the decisions made. The prior trail is authoritative input. Resist the urge to re-derive it.
3. Compare what is done with what is pending and name the resume point. Reuse valid source and reproduction evidence; do not redo completed work merely because another agent produced it.
4. Check material inherited claims against the original goal on the real artifact ([Prove It Works](../../principle-prove-it-works/SKILL.md)). Read existing evidence first. Rerun only when it is missing, stale, or contradicted; a passing self-report alone is not proof.
5. Route the remaining work to the matching playbook in the `polaris` skill's index, or to the relevant skill for a narrow task. Use `figure-it-out` (`../../figure-it-out/SKILL.md`) if no playbook fits work needing coordination. Continue under that playbook's steps and return here when it finishes. Preserve the requested outcome: implementation, a recommendation, a confirmed or overturned conclusion, or a postmortem.
6. When the resumed task is finished, set the note's `status` to `done` and update `updated`, so that no later pickup selects it.

**Reply:** the note or trail you selected and why, where the prior agent stopped, what you inherited and what you redid (ideally nothing), the resume point, and the outcome.
