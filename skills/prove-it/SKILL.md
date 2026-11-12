---
name: prove-it
description: "Verify one claim against real behavior and report VERIFIED, NOT VERIFIED, or INCONCLUSIVE. Use for \"prove it\", \"verify this\", \"did this fix it\", \"show me the evidence\", or before claiming that a change works."
---

# Prove it

Verify one claim with evidence that another person can reproduce. Derive the pass condition from the request, requirements, or existing contracts. Ask the user only when the missing condition requires their decision.

## Run the check

1. **State the claim and its pass condition.** For a behavior change, name the expected difference and any behavior that must remain unchanged. For a new artifact, list its acceptance criteria and starting state.

2. **Exercise the real behavior.**
   - For user-visible behavior, follow the project's `verify-<app>` skill when one exists. Otherwise, use the smallest harness that drives the real user path.
   - For code behavior, use a focused test or script that calls the real implementation.
   - For a bug fix, check the original failure scenario. A minimized regression test alone does not prove that the original scenario works.

3. **Establish the comparison when the claim needs one.** Compare old and new behavior under equivalent commands, inputs, environment, warmup, and configuration. Reuse an earlier baseline when it describes the same old state. For a new artifact, test each acceptance criterion from the documented starting state instead.

4. **Inspect the raw output.** Check for errors, skipped work, and unrelated activity that could affect the result. Save relevant output when it is needed to reproduce or audit the claim. For performance claims, follow [the measured-numbers checklist](references/measured-numbers.md). For evals, use representative trials and compare models only when the claim requires it.

5. **Compare the observation with the pass condition.** If the setup or measurement failed, fix the check. Do not weaken the criterion or narrow the claim to hide a failure.

## Return one verdict

- `VERIFIED`: Valid evidence meets every acceptance criterion, including any required comparison with the old behavior.
- `NOT VERIFIED`: A valid check shows that the behavior fails the claim or an acceptance criterion.
- `INCONCLUSIVE`: The available setup, baseline, measurements, or conditions cannot establish the claim.

Do not report an unrun or invalid check as verified. Reuse valid evidence rather than repeating a check that adds no information.

## Report the evidence

For an explicit verification request or a complex claim, use this format:

```text
VERIFIED | NOT VERIFIED | INCONCLUSIVE
Claim: <claim and pass condition>
Check: <verification skill, test, script, harness, or app path>
Evidence: <expected and observed results, with output or artifact paths>
Limitations: <confounds, missing evidence, or none>
```

For routine implementation work, give the same facts in concise prose. Keep custom checks and raw artifacts when they help the user rerun or audit the result. Do not include secrets or personal data in saved evidence or replies.
