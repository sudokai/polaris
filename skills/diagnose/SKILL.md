---
name: diagnose
description: "Diagnose bugs and regressions through reproduction, falsifiable hypotheses, targeted instrumentation, and regression checks. Use when something is broken or failing, especially when the cause is not obvious after initial inspection."
---

Find the fault that caused the failure. Work from the reported symptom and observed evidence, not from the first fix that seems plausible.

For an investigation-only request, do not change product code. Report the cause, evidence, and proposed fix.

## Investigate

1. **Define the symptom.** State the expected and actual behavior. Capture the exact error, output, timing, affected inputs, and environment that distinguish this failure from others nearby. Inspect the immediate stack trace and code first. Read any ADRs for the affected area.

2. **Build a feedback signal.** Choose the fastest check that reproduces the failure through its real path. Use an existing test when it reaches the failure. Otherwise, consider a CLI or HTTP script to drive the real entry point, browser automation for UI behavior, replay of a captured request or event, or a small harness around the failing path. Use bisection when you have a known-good and a known-bad state to compare, or differential and property tests when outputs diverge.

   Make the check assert the reported symptom, not any failure. Run it enough times to see how often and under what conditions the failure occurs. For an intermittent failure, increase the reproduction rate with realistic repetition, concurrency, or controlled timing, or capture traces when changing the timing would alter the failure.

   For a manual-only reproduction, adapt `scripts/hitl-loop.template.sh` to capture each action and observed result.

   Improve the check until it is fast and gives the same result every run: make it narrower, assert the specific symptom, and pin time, random seeds, files, and network.

   Do not form hypotheses until the failure reproduces reliably. If you cannot reproduce it, stop and say so. List what you tried, then ask the user for one of these: access to an environment where it fails, a captured artifact (logs, HAR file, core dump, recording), or permission to add temporary instrumentation in production. If the user cannot provide any, read the source, logs, and saved state, mark every conclusion as unverified, and do not say a fix works.

3. **Test explanations.** Write down 3–5 different hypotheses before testing any of them. Otherwise you will tend to stick with the first one that seems plausible. Give each an observable prediction, such as "If the cache is stale, its timestamp will precede the write." Rank them by the evidence so far.

   Show the ranked list to the user before testing. They may know about a recent deploy or a cause they already ruled out. If they are not available, continue without waiting. Test the cheapest prediction that separates the hypotheses.

   Use a debugger, REPL, targeted logs, or a measurement that shows the state that decides between the hypotheses. Change one variable at a time when practical. Treat a probe that contradicts the prediction as evidence, including when it disproves the preferred explanation.

4. **Identify the fault.** Trace the symptom to the first incorrect decision or invalid state. If that state is legitimate, handle it where it starts. If it is invalid, stop the code from creating it. Do not add a downstream workaround that merely hides the failure.

   For performance regressions, compare equivalent baseline and treatment measurements, following [the measured-numbers checklist](references/measured-numbers.md).

5. **Fix and check the fault.** Before changing production code, write a regression test that runs the same code path and conditions that caused the bug, when practical. Confirm that it fails for the reported reason. Apply the fix, confirm that the test passes, and run related tests.

   If no test can reach the failing code path under the real conditions, report that as a finding: the code structure makes this bug hard to test. Keep the closest executable reproduction and state what it does not cover. Do not substitute a shallow test that cannot reproduce the failure.

   If two fixes based on the same explanation fail the same check, stop fixing. Write down the assumption both fixes share, and test whether it holds before you try a third fix. If the test contradicts it, return to step 3 with new hypotheses.

## Clean up and report

Recheck the original scenario when the fault has been fixed. Remove temporary probes and unused prototypes. Use a unique `[DEBUG-<id>]` prefix for temporary logs so the search for leftovers is complete.

Report the confirmed or possible cause, reproduction evidence, fix or proposed fix, regression result, and remaining limits. Distinguish observation from inference. If the evidence does not establish the cause, say what would distinguish the remaining explanations.

State the confirmed cause in the commit or PR message.

After the fix, work out what would have prevented the bug, such as code that tests cannot reach, tangled callers, or hidden coupling. If a structural change would help, recommend it after the fix, not before.
