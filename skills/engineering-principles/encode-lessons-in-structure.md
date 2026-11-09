# Encode lessons in structure

Use the highest tier that addresses the actual failure without a disproportionate change. Do not redesign unrelated code or add a standing process for a one-off mistake.

1. **Codebase.** Change the API, data model, ownership, module boundary, or implementation structure so the incorrect action cannot happen. Remove misleading paths and obsolete alternatives. Prefer this over adding a rule readers must remember.
2. **Static analysis and ordinary checks.** Use types, compiler checks, linters, tests, and CI to reject or detect the mistake in the usual development path. Reuse an existing check before creating another one.
3. **Verification.** Add a focused empirical or formal check when ordinary checks cannot establish the required property. Examples include differential testing, a failure reproduction, performance measurement, or model checking.
4. **Prose.** Use written guidance when the remaining decision requires interpretation, judgment, context, or a manual procedure. Prose includes instructions in `AGENTS.md`, skills, code comments, examples, documentation, rationale, and navigation pointers. It tells a human or agent what to do, why, or where to look; it does not prevent or detect an incorrect change by itself.
5. **Human review.** Ask for a person’s review when the choice concerns requirements, preferences, tradeoffs, or consequences that the available tools cannot decide. Do not use routine human review to compensate for a check that could run automatically.

Keep prose specific to the situation, action, and relevant reason. A pointer to useful material is better than copying its contents. Do not add generic advice, restate a lesson merely because it sounds prudent, or retain an instruction after a stronger safeguard has made it redundant.

When adding a safeguard, exercise it against a genuine example of the original failure. Establish that the safeguard detects the failure and that the intended behavior remains valid. Report any remaining case it cannot cover.
