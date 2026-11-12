# Session pickup

**You own the resume point. Read the prior trail, don't redo it.**

1. Select the resume note:
   - If the user names a note or a path, use it.
   - Otherwise, read the header fields of each note in `.agents/polaris/resume/` whose `status` is `in-progress` ([resume note format](references/resume-note.md)). If the user named the task, keep the notes whose `task` matches it. Otherwise, keep the notes whose `branch` and `worktree` match the current ones.
   - If one note matches, use it. If several match, list each one's `task`, `branch`, and `updated`, and ask which to resume. Never choose by recency alone.
   - If none matches, use a pushed branch or a transcript instead. Read only this project's transcripts unless the user points at another. Read the metadata and the last messages first, then scan back for the decision points. Parse a long transcript in a subagent, and keep only the reduced timeline in your context (`../../engineering-principles/guard-the-context-window.md`).
2. Reconstruct the operational state: the branch and worktree, what already landed (`git log`, and `git diff` against the base), the running playbook and step from the note's `playbook` field, the open todos, and the decisions in the note's decision log. The prior trail is authoritative input. Resist the urge to re-derive it.
3. Compare what is done with what is pending and name the resume point. Reuse valid source and reproduction evidence; do not redo completed work merely because another agent produced it.
4. Test the prior agent's important claims on the real artifact, against the original goal (`../../engineering-principles/prove-it-works.md`). Read existing evidence first. Rerun only when it is missing, stale, or contradicted; a passing self-report alone is not proof.
5. Route the remaining work to the matching playbook in the `polaris` skill's index, or to the relevant skill for a narrow task. If no playbook fits substantial work, write one as the router describes. Continue under that playbook's steps and return here when it finishes. Preserve the requested outcome: implementation, a recommendation, a confirmed or overturned conclusion, or a postmortem.
6. When the resumed task is finished, set the note's `status` to `done` and update `updated`, so that no later pickup selects it. If the user drops the task instead, set it to `abandoned`.

**Reply:** the note or trail you selected and why, where the prior agent stopped, what you inherited and what you redid (ideally nothing), the resume point, and the outcome.
