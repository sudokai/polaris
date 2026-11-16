# Prove a change

**You own the proof. A reviewer who will not read the code must be able to see from it that the change does what was claimed and breaks nothing.**

Before step 1, read [prove-it](../../prove-it/SKILL.md) in full. `prove-it` says how to check each case, which verdict to give, and how to report it. This playbook adds the steps before and after those checks.

Run steps 1 to 3 before implementing the change, and steps 4 to 7 after it. When the change already exists, still run step 1 before you run anything, take the baseline from the base commit, and say in the reply that the cases were written after the change. Scale each step to the change: a one-line fix needs one case and one control.

1. List the claims and the case that shows each one, with its pass condition, as step 1 of `prove-it` describes. Include the reported scenario, with the reporter's exact data and conditions; each interface where users reach the changed behavior, including its loading, failure, and recovery states; a control case whose behavior must not change; and the questions a reviewer will ask next when the change puts them at risk, such as performance, resource cleanup, other platforms, and behavior after a restart or reconnect. Do not edit the cases afterwards to fit the code; if one turns out wrong, say so in the reply.
2. Find or build the way to drive the real app. Use the project's `verify-<app>` skill when one exists. When the project has none, or the proof needs setup it lacks, build reusable tooling with `empirical-verification-skill` and the `build-the-lever` principle; [the proof techniques](../../prove-it/references/techniques.md#validation-tooling-worth-building) list examples.
3. Reproduce the failure on the unchanged code, or capture the starting state for a feature, with one script you will rerun unchanged, as step 3 of `prove-it` describes. When a bug will not reproduce reliably, use `diagnose` to build the reproduction. If it still does not reproduce, say so and claim only what the runs show.
4. After the change, rerun the same script for every case, and give each case a `prove-it` verdict: `VERIFIED`, `NOT VERIFIED`, or `INCONCLUSIVE`. When the reported scenario is hard to run, fix the setup instead of switching to an easier case. If you substitute a case, the reported scenario stays unproven.
5. Check what the change could break outside the cases (`blast-radius`).
6. Justify every line the diff touches. For each removed line, changed comment, touched shared file, and configuration edit, show that the change is needed, or revert it. Read the diff of every test file for deleted, skipped, or loosened assertions, expected values changed to match the new output, and code that special-cases test inputs; each needs a reason in the reply. Check a subagent's claims against the diff, not its report.
7. Delete what the proof created in shared systems, such as test accounts, sandboxes, branches, and rows in staging services. Keep one script that reruns the decisive cases.

**Reply:** fill in every slot of this template. When a slot does not apply, write `none` and the reason instead of dropping it. While any gap remains, call the proof strong, not irrefutable.

```markdown
<VERIFIED | NOT VERIFIED | INCONCLUSIVE>: <what was proven, and at what level, such as "end to end on the local stack; not deployed">

Cases, written <before | after> the change, baseline from <commit>:
- <case> (<reported | control | other>): expected <x>, before <y>, after <z>, <verdict>. Evidence: <output, log line, or embedded screenshot>

Blast radius: <risks checked and what each check ruled out, risks left untested>
Diff audit: <each removed or changed line and why it is required; deleted, skipped, or loosened test assertions>
Went wrong during the proof: <discarded runs, corrected cases>
Not proven: <gaps and why>
Rerun: <command that rebuilds what it needs and reruns every case>, evidence in <path>
```
