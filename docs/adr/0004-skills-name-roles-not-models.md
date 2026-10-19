# Skills name roles, not models

Skills name one of four roles (`ultra`, `deep`, `standard`, `fast`), and `skills/polaris/references/models.md` maps each role to a model and an effort level per harness. A role includes effort because effort changes cost and quality as much as the model does. Keeping models in one table lets one skill text run in every harness, and lets the user change models without editing skills.

Roles apply only where a skill already starts a subagent: for parallel work, an independent opinion, or bulk reading. A skill never starts a subagent only to switch models, because the subagent loses the main agent's context. A user who wants `ultra` judgment throughout starts the session on that model.

## Considered options

- **Budget presets** from pstack. Rejected: editing four lines of a model override file does the same.

## Consequences

- When a harness cannot apply a role, the skill uses a fallback from `models.md` and says so in its reply instead of failing silently.
- `setup-polaris` writes only models that it confirmed are available, and rewrites the whole file, so a second run with the same answers gives the same file.
