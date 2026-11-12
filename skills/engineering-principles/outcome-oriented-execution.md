# Outcome-Oriented Execution

Optimize for the intended, verifiable end state rather than preserving smooth intermediate states.

**Why:** Keeping every intermediate step fully stable often creates temporary compatibility code that becomes long-lived debt. Move to the target architecture and prove it correct at checkpoints the plan names.

**Core rule:**
- Intermediate breakage is acceptable when it is planned, scoped, and reversible

**Guardrails:**
- Use this for planned rewrites and migrations with explicit phase boundaries
- Declare where temporary breakage is acceptable
- While migrating, keep running the checks most likely to catch a break in the areas you are changing
- When the plan is done, run the full static and runtime checks
