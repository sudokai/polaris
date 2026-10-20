# Set up verification

**You own a verification skill that the next agent can run cold. A skill that was never executed is a draft, not a deliverable.**

Use this playbook when a project has no scripted way to launch its app, drive a feature the way a user does, and capture evidence. If the project already has a `verify-<app>` skill, run the `maintain-verification-skill` skill (`../../maintain-verification-skill/SKILL.md`) instead.

1. Map the app with the `how` skill (`../../how/SKILL.md`): how it starts, what a user touches (web UI, CLI or TUI, desktop app, API, library), the main user-facing features, and any existing test harnesses. Answer from the code. Ask the user only for what you cannot observe.
2. Make the checkout build and start as-is. If it does not, fix it, or report precisely what blocks it, before you generate anything. A skill written against a broken base teaches wrong steps.
3. Generate the skill and its feature map with the `create-verification-skill` skill (`../../create-verification-skill/SKILL.md`).
4. Prove the generated skill on one mapped feature with the `prove-it` skill (`../../prove-it/SKILL.md`): launch, doctor, drive, capture evidence, and clean up. Confirm that the evidence still exists after cleanup. Fix the skill and repeat until it passes ([Prove It Works](../../principle-prove-it-works/SKILL.md)).
5. Tell the user how to keep the skill accurate: run the `maintain-verification-skill` skill after changes to user-facing features. Suggest a cadence only if they ask.

**Reply:** the surface and the features in the map, the skill's path, the `prove-it` verdict for the proven feature with the evidence path, and anything you could not drive with the prerequisite that blocked it.
