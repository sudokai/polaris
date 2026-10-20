# Refactor

**Change the structure and prove that the agreed behavior is preserved.**

Use to reorganize code or replace an internal design while preserving behavior. For behavior changes, use [Feature development](feature-development.md); for failures, use [Bug fix](bug-fix.md). If a migration needs a different sequence, use `figure-it-out` to design its playbook.

1. Define the structural goal and which behavior, public contracts, and stored data must stay unchanged. Use `how` for gaps and `why` for unexplained constraints. Distinguish requested internal API changes from contracts to preserve.
2. Capture baseline evidence through the affected users' interfaces, using existing checks or a harness that runs real code. Review tests that fail on harmless internal changes with `no-change-detector-tests`. Preserve useful coverage and record existing failures before editing tests.
3. Use `architect` for substantial changes to types, interfaces, ownership, or module boundaries. Reuse an agreed design that fits. Before editing, divide the work into checkable units and declare any migration phase boundaries.
4. Make the changes under [implementation rules](references/executing-implementation-steps.md), using `write-discoverable-code`. Keep baseline checks passing at each declared boundary. Migrate internal API callers together and remove the old API when they can move in one change, per `principle-migrate-callers-then-delete-legacy-apis`. Return design problems to architect with their evidence.
5. Use `prove-it` to compare final behavior with the baseline under equivalent conditions. Explain intended internal contract changes separately. Fix or report behavior changes outside scope; do not change the baseline to hide them.
6. Finish under [completion rules](references/finish-implementation.md) and deliver the requested structural change.

**Reply:** the structural change and its benefit, preserved contracts, baseline comparison and other checks, behavior differences, and verification limits.
