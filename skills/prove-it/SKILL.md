---
name: prove-it
description: "Verify one claim against real behavior and report VERIFIED, NOT VERIFIED, or INCONCLUSIVE. Use for \"prove it\", \"verify this\", \"did this fix it\", \"show me the evidence\", or before claiming that a change works."
---

# Prove it

Verify one claim with evidence that another person can reproduce. Every claim needs an observation that would have come out differently if the claim were false. Derive the pass condition from the request, requirements, or existing contracts. Ask the user only when the missing condition requires their decision.

## Run the check

1. **State the claim and its pass condition.** For a behavior change, name the expected difference and any behavior that must remain unchanged. For a new artifact, list its acceptance criteria and starting state.

2. **Exercise the real behavior the way users reach it.**
   - For user-visible behavior, follow the project's `verify-<app>` skill when one exists. Otherwise, use the smallest harness that drives the real user path.
   - For code behavior, use a focused test or script that calls the real implementation.
   - For a bug fix, check the original failure scenario. A minimized regression test alone does not prove that the original scenario works.
   - Test at the strongest level the environment allows. From strongest to weakest: the deployed product or a staging copy through its real interface, the full local stack, one real component with the real components it talks to, integration tests through a public interface, then unit tests and mocks. A test that mocks the boundary where the bug lives passes whether or not the bug is fixed. Report the level reached, and name what any shortcut skipped, such as calling an internal API instead of driving the UI.
   - Run the new code path itself, on the most realistic target you can reach: a real machine or device before a simulator, a simulator before a substitute. Passing Linux runs do not cover new macOS code. Report a path as unproven only after trying, and say what you tried.
   - For packaged software, check what ships: the built container, bundle, binary, or installed package. Source-tree tests still pass when the package leaves out a file.
   - When a dependency is out of reach, fake that one part and keep the rest real, following [the proof techniques](references/techniques.md). For a change to prompts, skills, or other agent instructions, follow [the eval method](references/agent-instructions.md).

3. **Establish the comparison when the claim needs one.** Compare old and new behavior under equivalent commands, inputs, environment, warmup, and configuration. Reuse an earlier baseline when it describes the same old state. For a new artifact, test each acceptance criterion from the documented starting state instead.
   - Write one script or procedure, run it on the old code, and rerun it unchanged on the new code. Change nothing else between the runs: not the data, the timing, the injected delays, or the viewport.
   - Confirm which code each run executed. Restart servers, workers, and clients after switching code, because long-running processes keep serving the old code. Check a version string, build hash, or log line that differs between the builds.
   - If the failure does not reproduce on the old code, the new run proves nothing. Change the environment until it reproduces, or return `INCONCLUSIVE`.
   - For a refactor or a new check, plant a deliberate behavior change and confirm the check detects it. A check that cannot detect a planted change proves nothing.
   - When the outcome varies between runs, as with a feature that calls a model, compare pass rates over repeated runs on both sides.

4. **Inspect the raw output.** Check every screenshot, recording, and log against the claim it supports. Discard a run, rerun it, and report the discarded run when a process still ran old code, state carried over from the other run, the capture landed during an animation, scroll, or retry, a setup step failed silently, or an error appeared that the claim did not predict. Back each screenshot with a state fact that confirms it, such as an attribute value, a row count, or a log line. Check for skipped work, and save relevant output when it is needed to reproduce or audit the claim. For performance claims, follow [the measured-numbers checklist](references/measured-numbers.md).

5. **Compare the observation with the pass condition.** If the setup or measurement failed, fix the check. Do not weaken the criterion or narrow the claim to hide a failure.

## Return one verdict

- `VERIFIED`: Valid evidence meets every acceptance criterion, including any required comparison with the old behavior.
- `NOT VERIFIED`: A valid check shows that the behavior fails the claim or an acceptance criterion.
- `INCONCLUSIVE`: The available setup, baseline, measurements, or conditions cannot establish the claim.

Do not report an unrun or invalid check as verified. If a case never happened during the check, report it as unexercised, not as passed. Reuse valid evidence rather than repeating a check that adds no information.

## Report the evidence

For an explicit verification request or a complex claim, use this format:

```text
VERIFIED | NOT VERIFIED | INCONCLUSIVE
Claim: <claim and pass condition>
Check: <verification skill, test, script, harness, or app path, and the level it reached>
Evidence: <expected and observed results, with output or artifact paths>
Limitations: <shortcuts, fakes, confounds, missing evidence, or none>
```

For routine implementation work, give the same facts in concise prose. Build the report from output you captured; never retype or edit it by hand. Label a simulation, a calculation, or a line of reasoning as such, because it is not a run. Keep custom checks and raw artifacts when they help the user rerun or audit the result. Do not include secrets or personal data in saved evidence or replies.
