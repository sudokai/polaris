# Session pickup

**You own the resume point. Read the prior trail, don't redo it.**

Use this playbook to resume one specific piece of unfinished work. To catch up on a topic across many sessions, use the `recall` skill (`../../recall/SKILL.md`) instead.

1. Select the resume note (`../references/locations.md`):
   - If the user names a note or a path, use it.
   - Otherwise, read the header fields of each note in `.agents/polaris/resume/` whose `status` is not `done`. If the user named the task, keep the notes whose `task` matches it. Otherwise, keep the notes whose `branch` and `worktree` match the current ones.
   - If one note matches, use it. If several match, list each one's `task`, `branch`, and `updated`, and ask which to resume. Never choose by recency alone.
   - If none matches, use a pushed branch or a transcript instead. Find transcripts with `../references/harnesses.md`, and read only this project's transcripts unless the user points at another. Read the metadata and the last messages first, then scan back for the decision points. Parse a long transcript in a subagent on the `fast` role and keep only the reduced timeline in your context ([Guard the Context Window](../principles/guard-the-context-window.md)).
2. Reconstruct the operational state: the branch and worktree, what already landed (`git log`, and `git diff` against the base), the open todos, and the decisions made. The prior trail is authoritative input. Resist the urge to re-derive it.
3. Compare what is done with what is pending. Name the resume point. Do not rerun the prior repro or redo completed work. A "let me verify from scratch" pass treats an authoritative trail as untrustworthy.
4. Route the remaining work to the matching playbook in the `polaris` skill's index, or to the principles if none matches, and pick the outcome: continue the work, deliver a finished recommendation, confirm or overturn a prior conclusion, or write a postmortem of a failed run. This playbook ends here. The routed work owns the rest.
5. Verify the inherited claims against the original goal on the real artifact ([Prove It Works](../principles/prove-it-works.md)). A prior agent's passing self-report is not proof.
6. When the resumed task is finished, set the note's `status` to `done` and update `updated`, so that no later pickup selects it.

**Reply:** the note or trail you selected and why, where the prior agent stopped, what you inherited and what you redid (ideally nothing), the resume point, and the outcome.
