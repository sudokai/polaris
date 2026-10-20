---
name: prove-it
description: "Prove or disprove one claim with fresh evidence: compare changed behavior or accept a new artifact against observable criteria, then return VERIFIED, NOT VERIFIED, or INCONCLUSIVE. Use for \"prove it\", \"verify this\", \"did this fix it\", \"show me the evidence\", or before claiming that a change works."
---

# Prove it

Proof is not a recap. It proves or disproves one specific claim with evidence that someone else can repeat. `principle-prove-it-works` says why. This skill says how.

Do not use it for vague claims like "the code is cleaner". Ask for a measurable claim first.

## Workflow

1. **Restate the claim so it can be shown false.** Name the condition, the metric, and the threshold. For example: "After the fix, saving a note with an emoji title persists the title across a restart."
2. **Pick the surface.** Use the smallest surface that can disprove the claim, in this order:
   1. The project's `verify-<app>` skill, made by the `create-verification-skill` skill, when the claim is about user-visible behavior. Follow its launch, doctor, drive, evidence, and cleanup steps.
   2. If the project has no verification skill and the claim is about user-visible behavior, offer to create one with the Set up verification playbook. Until it exists, drive the app with the smallest local harness you can build.
   3. For code behavior, a focused test or a minimal repro script that calls the real code.
3. **Choose the comparison.** For a change claim, capture a baseline from the old state: the merge base, parent commit, failing branch, or broken repro. For acceptance of a new artifact, state observable pass/fail criteria and initial conditions; do not invent a broken predecessor.
4. **Run the check.** For a change claim, capture the treatment with the same command, data, warmup, and environment. For acceptance, follow the artifact's instructions from the stated initial conditions and record the resulting behavior, including cleanup when it is part of the claim.
5. **Inspect the raw artifacts**: numbers, screenshots, terminal transcripts, HTTP responses, profiles, heap snapshots, or test output. Compare them against the claimed relationship or acceptance criteria. If the claim is a measured number, explain it per `principle-explain-the-number`, and follow [`references/measured-numbers.md`](references/measured-numbers.md) before you trust it.
6. **Say how far the proof got.** Place the evidence on this ladder, and name the highest step you reached:
   1. Claimed. You said so. Worthless on its own.
   2. Line cited. A real `file:line`, or the library's own source.
   3. Failure walked through. You walked the failure step by step, and it does not happen.
   4. Script run. A script or test that calls the real code ran, and would fail loudly if the claim were wrong.
   5. Reproduced in the app. You drove the running app and observed the result.
7. **Return exactly one verdict:** `VERIFIED`, `NOT VERIFIED`, or `INCONCLUSIVE`.

## Verdict rules

- `VERIFIED`: baseline and treatment satisfy the claimed relationship, including equivalence for a behavior-preserving refactor, with no obvious confound; or an acceptance run meets all stated criteria on the real artifact.
- `NOT VERIFIED`: the comparison fails the claimed relationship or threshold, or the artifact fails an acceptance criterion.
- `INCONCLUSIVE`: a required baseline is missing, the signal is noisy, the measurement failed, the surface was wrong, or the conditions prevent a valid comparison or acceptance run.

"Inconclusive" is never a pass. Do not soften a negative result. A clear `NOT VERIFIED` is useful.

## Artifacts

When it is safe to write artifacts, keep them where a reviewer can rerun the check:

```text
<scratch>/prove-it/<claim-slug>/
├── claim.md
├── baseline/
├── treatment/
├── diff/
└── verdict.md
```

Keep a script that reruns the comparison next to the artifacts. If the artifacts may contain sensitive code, prompts, screenshots, HTTP bodies, or heap data, keep only the minimal evidence inline unless the user agrees to storing it on disk.

For acceptance, keep the criteria, initial conditions, run output, and verdict; baseline and treatment directories are unnecessary. In the reply below, replace the baseline/treatment line with each criterion, observed result, and evidence path.

## Output

```text
VERIFIED | NOT VERIFIED | INCONCLUSIVE
Claim: <falsifiable claim>
Surface: <verification skill, harness, test, or script used>
Proof reached: <highest ladder step>

Evidence:
<metric or artifact>: baseline=<...>, treatment=<...>, delta=<...>, threshold=<...>

Reasoning:
<one short paragraph that names the evidence and any confounds>
```
