# Bug fix

**Deliver a verified fix. Diagnose provides the investigation and regression-test method.**

Use to fix a bug, failure, or performance regression. For investigation only, use `diagnose`. For an intentional behavior change, use `feature-development.md`.

1. State the reported failure and what would show it fixed. Run `diagnose` to reproduce, investigate, and fix it with a `tdd` regression cycle. Follow `README.md#executing-implementation-steps`. Reuse findings and reproductions that still apply.
2. Verify the original scenario with `prove-it`. Reuse diagnose's before-and-after runs when they test the claim. A minimized regression test alone does not replace the original scenario. If the fix changes shared contracts, investigate risks not covered by the reproduction with `blast-radius`.
3. Finish under `README.md#finish-implementation`. Report diagnose's prevention recommendations separately; do not expand the fix into an unrequested redesign.

**Reply:** symptom, cause, fix, evidence from the original scenario, regression coverage or why no suitable test could be written, prevention recommendations, and limitations.
