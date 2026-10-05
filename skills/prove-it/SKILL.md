---
name: prove-it
description: "Prove or disprove one claim with fresh evidence: restate it falsifiably, test it on the project's real surface, compare baseline and treatment, and return VERIFIED, NOT VERIFIED, or INCONCLUSIVE. Use for \"prove it\", \"verify this\", \"did this fix it\", \"show me the evidence\", or before claiming that a change works."
disable-model-invocation: true
---

# Prove it

This is the bundled `prove-it` skill. Before you follow it, check whether `<project>/.agents/polaris/skills/prove-it/SKILL.md` or `~/.agents/polaris/skills/prove-it/SKILL.md` exists. If one does, follow the first that exists instead of this file, and resolve its references and scripts as `../polaris/references/locations.md` describes.

Proof is not a recap. It proves or disproves one specific claim with evidence that someone else can repeat. [Prove It Works](../polaris/principles/prove-it-works.md) says why. This skill says how.

Do not use it for vague claims like "the code is cleaner". Ask for a measurable claim first.

## Workflow

1. **Restate the claim so it can be shown false.** Name the condition, the metric, and the threshold. For example: "After the fix, saving a note with an emoji title persists the title across a restart."
2. **Pick the surface.** Use the smallest surface that can disprove the claim, in this order:
   1. The project's `verify-<app>` skill, made by the `create-verification-skill` skill (`../create-verification-skill/SKILL.md`), when the claim is about user-visible behavior. Follow its launch, doctor, drive, evidence, and cleanup steps.
   2. If the project has no verification skill and the claim is about user-visible behavior, offer to create one with the Set up verification playbook. Until it exists, drive the app with the smallest local harness you can build.
   3. For code behavior, a focused test or a minimal repro script that calls the real code.
3. **Capture a baseline** from the old state: the merge base, the parent commit, the failing branch, or the current broken repro.
4. **Capture the treatment** from the changed state, with the same command, data, warmup, and environment.
5. **Compare the raw artifacts**: numbers, screenshots, terminal transcripts, HTTP responses, profiles, heap snapshots, or test output. If the claim is a measured number, also follow [`references/measured-numbers.md`](references/measured-numbers.md) before you trust it.
6. **Say how far the proof got.** Place the evidence on this ladder, and name the highest step you reached:
   1. Claimed. You said so. Worthless on its own.
   2. Line cited. A real `file:line`, or the library's own source.
   3. Failure walked through. You walked the failure step by step, and it does not happen.
   4. Script run. A script or test that calls the real code ran, and would fail loudly if the claim were wrong.
   5. Reproduced in the app. You drove the running app and observed the result.
7. **Return exactly one verdict:** `VERIFIED`, `NOT VERIFIED`, or `INCONCLUSIVE`.

## Verdict rules

- `VERIFIED`: baseline and treatment differ in the predicted direction, by the claimed threshold, with no obvious confound.
- `NOT VERIFIED`: the behavior is unchanged, moves the wrong way, or misses the threshold.
- `INCONCLUSIVE`: there is no valid baseline, the signal is noisy, the measurement failed, the surface was wrong, or an environment difference invalidates the comparison.

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
