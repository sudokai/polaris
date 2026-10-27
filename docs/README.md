# polaris documentation

- [`GLOSSARY.md`](../GLOSSARY.md) defines the terms polaris uses.
- [`adr/`](adr/) records the decisions that shape the plugin and why they were made.
- [`open-work.md`](open-work.md) lists deferred work and harness behavior that is not yet verified.
- [Model budget verification](model-budget-verification.md) records source checks, model comparisons, and live harness limitations.
- [Syncing from pstack](upstream-sync.md) records the last pstack commit ported into polaris, so the next sync starts after it.

The working contracts live with the skills: [Locations](../skills/polaris/references/locations.md) for local files and local playbooks, [Model budgets](../skills/polaris/references/models.md) for model budgets, and [Harnesses](../skills/polaris/references/harnesses.md) for per-harness facts.

## Decisions

1. [Harness-neutral, self-contained plugin](adr/0001-harness-neutral-self-contained-plugin.md)
2. [Explicit and automatic skill invocation](adr/0002-explicit-and-automatic-skill-invocation.md)
3. [Model allocation by assignment and budget](adr/0003-model-allocation-by-assignment-and-budget.md)
4. [Scoped lessons and structural fixes](adr/0004-scoped-lessons-and-structural-fixes.md)
5. [Callers coordinate tasks; skills own methods](adr/0005-callers-coordinate-skills-own-methods.md)
6. [Resume selection uses task identity](adr/0006-resume-selection-uses-task-identity.md)
7. [Prompt rewriting stops before execution](adr/0007-prompt-rewriting-stops-before-execution.md)
8. [Local customization and skill copies](adr/0008-local-customization-and-skill-copies.md)
