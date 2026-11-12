# Attack the Premise

When two or more fixes that share one premise have failed the same check, suspect the premise, not the fixes.

**Why:** Each failed fix is evidence against the belief it assumed. A third fix on the same premise spends effort where the evidence already says the cause is not.

**Pattern:**
- **Write the premise down.** The premise is the one sentence that every failed fix assumed.
- **Test the premise before the next fix.** Find a check whose result would differ if the premise were false, and run it. Look at how the failures are distributed, not only at how large they are. Make the check rerunnable, as `build-the-lever.md` describes.
- **Follow the evidence.** If it contradicts the premise, the cause is elsewhere. Look for what the failures have in common that the premise did not predict. If it confirms the premise, ask the next "why", as `fix-root-causes.md` describes. The earlier fixes may have treated a consequence instead of the cause.
- **Remove the condition instead of compensating for it** (see `laziness-protocol.md`). If the evidence shows that one component always loses a race or a priority order, change what makes it lose. Cleaning up after the loss leaves the cause in place and adds work to every run.

**Stop:** Do not start the next fix before the premise is written down and tested.

This principle is distinct from `redesign-from-first-principles.md`, which rebuilds a design around a new requirement. This principle questions a fact the current design assumes.
