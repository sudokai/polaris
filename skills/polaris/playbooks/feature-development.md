# Feature development

**Deliver the requested feature with evidence that it works. Skills provide the methods.**

Use when asked to add or change behavior. For failures, use `bug-fix.md`; for structural changes that preserve behavior, use `refactor.md`. Requests only to discuss, explain, prototype, or design stay with the relevant skill.

1. Define the behavior, scope, and completion checks. Use `how` to fill gaps in understanding the code, `why` for unexplained constraints, and `discuss` for unresolved product choices. Do not reopen settled choices.
2. Capture existing behavior that must stay unchanged and establish checks for the feature. If verification needs a missing app harness, run `set-up-verification.md` as a nested playbook, or use a focused harness when full setup exceeds scope.
3. Use `architect` for substantial program, system, product, or foundational design, even when the approach seems clear. Pass existing findings and checks; reuse a design that fits. Use `prototype` for choices the user must judge by trying them.
4. Implement the design under `README.md#executing-implementation-steps`. Use `tdd` for testable behavior and `write-discoverable-code` for code. If the design no longer fits, return to architect with the evidence.
5. Use `prove-it` to check new and preserved behavior, reusing valid implementation evidence. Investigate shared-contract or significant dependency risks not covered by those checks with `blast-radius`.
6. Finish under `README.md#finish-implementation` and deliver the requested feature.

**Reply:** what changed for users, key design choices, checks and evidence, limitations, and the requested artifact.
