# Sequence work into verifiable units

Order work as a sequence of small units, each ending in a state you can check, and don't advance until the current one is green.

**Why:** A break caught at the unit that caused it is cheap to localize. A break caught after a batch is buried, and you have already built further on a broken base. Delivered in the same order, the units let a reviewer replay the work and watch each check fail, then pass.

**Execution.** In a sweep, migration, or any run of similar edits, verify each change before starting the next. Each unit runs from a known-good state through one change to a passing check. Rebase onto clean trunk first so every check measures against the real baseline. When a lever does the edits, the per-unit check is nearly free. Run it anyway.

**Delivery.** Stack commits and PRs in the order that proves the work. The standard order is a failing test, then the fix on top. Other useful orders are a removal before the restructuring, a baseline measurement before the change, and the scaffold before the feature. Each commit stands on its own, and the order shows why the change is correct.

This complements `prove-it-works.md`, which keeps each check real, and `build-the-lever.md`, which makes the per-unit check cheap.
