# Scoped lessons and structural fixes

`reflect` identifies lessons and routes them to the narrowest destination that covers the mistake class. `correct` implements repo-side fixes in architecture, types, automated checks, tests, or documentation. Separating them lets a user approve a lesson's scope and concrete change before the learning flow applies it.

A finding explains the incident, the mistake class, and the destination. Generalization stops before the wording loses a recognizable trigger, a concrete action, or supporting evidence. A project lesson may name its repository's files and tasks. A user lesson must hold across kinds of work without depending on one repository. Broad advice without an actionable distinction is rejected.

Personal preferences require evidence across projects before becoming global instructions, except for preferences specific to one harness. A session may still propose a general lesson about agent behavior from one project, explicitly marked for the user's scope review. Repeated lessons across projects can be promoted to user scope without editing other repositories.

Session and history modes share lesson routing and approval. Their evidence filters differ. Session review limits skill-directed findings to capabilities used in the session, while repo-side findings are exempt. History review requires repetition. A finding may generalize upward, but does not authorize editing an unrelated skill.

Repeated mistakes call for structural fixes rather than accumulating instructions. A first occurrence may justify a rule; recurrence calls for stronger enforcement. Approved structural work goes to `correct` in the same session unless the user chooses to defer it. The backlog is not a destination for unapproved ideas.

Reviewer coverage, finding formats, scope tests, and application procedures live in [reflect](../../skills/reflect/SKILL.md) and [correct](../../skills/correct/SKILL.md). Learning follows the [customization boundary](0008-local-customization-and-skill-copies.md).
