# Delegation

When you brief a subagent to run a skill, give it the skill file's absolute path.

- Start a subagent only for parallel work, an independent opinion, or bulk reading that would flood your context. Classify the assignment and choose its model–effort pair with [model budgets](models.md); the default budget is medium.
- Reuse evidence already gathered for this task. Give each worker a bounded question and source pointers; ask for concise findings, citations, contradictions, and gaps rather than a second full explanation. Focused workers do not start further agents unless their brief assigns orchestration.
- Brief a general delegate, such as a code-writing subagent, with this first line: "Read the `polaris` skill's `SKILL.md` before any work." Give the file's absolute path. Then give the scope: file paths, the named data shape, the success criteria, and pointers to files instead of pasted content.
- A subagent that a skill starts with its own prompt does not read the [polaris router](../SKILL.md). Use the skill's prompt as written.
- You own every subagent's work. Review its diff yourself, and write your own summary instead of repeating its report.
- Continue an existing subagent for related work when the harness supports retained context and that context still helps. Refresh changed files and constraints in the follow-up. Start fresh for unrelated work, overloaded context, or independent judgment. Give reviewers the evidence and proposals they must assess, without seeding a preferred verdict. If continuation is unavailable, pass a concise handoff with the current scope, constraints, evidence, and open questions. See `harnesses.md` for support.

