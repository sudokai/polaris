# Session pickup

**You own the resume point. Read the prior trail, don't redo it.**

Use this playbook to resume one specific piece of unfinished work. To catch up on a topic across many sessions, use the `recall` skill (`../../recall/SKILL.md`) instead.

1. Locate the prior trail: a resume note in `.polaris/resume/` (written by the Pause safely playbook), a pushed branch, or a transcript. Find transcripts with `../references/harnesses.md`, and read only this project's transcripts unless the user points at another. Read the metadata and the last messages first, then scan back for the decision points. Parse a long transcript in a subagent on the `fast` role and keep only the reduced timeline in your context ([Guard the Context Window](../principles/guard-the-context-window.md)).
2. Reconstruct the operational state: the branch and worktree, what already landed (`git log`, and `git diff` against the base), the open todos, and the decisions made. The prior trail is authoritative input. Resist the urge to re-derive it.
3. Compare what is done with what is pending. Name the resume point. Do not rerun the prior repro or redo completed work. A "let me verify from scratch" pass treats an authoritative trail as untrustworthy.
4. Route the remaining work to the matching playbook in the `polaris` skill's index, or to the principles if none matches, and pick the outcome: continue the work, deliver a finished recommendation, confirm or overturn a prior conclusion, or write a postmortem of a failed run. This playbook ends here. The routed work owns the rest.
5. Verify the inherited claims against the original goal on the real artifact ([Prove It Works](../principles/prove-it-works.md)). A prior agent's passing self-report is not proof.

**Reply:** where the prior agent stopped, what you inherited and what you redid (ideally nothing), the resume point, and the outcome.
