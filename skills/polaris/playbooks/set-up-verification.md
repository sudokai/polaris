# Set up verification

**You own a verification skill that the next agent can run cold. A skill that was never executed is a draft, not a deliverable.**

Use this playbook when a project has no scripted way to launch its app, drive a feature the way a user does, and capture evidence. If the project already has a `verify-<app>` skill, run the `maintain-verification-skill` skill (`../../maintain-verification-skill/SKILL.md`) instead.

1. Map missing app knowledge with `how` (`../../how/SKILL.md`): startup, user-facing surfaces and features, existing harnesses, and isolation requirements. Reuse findings already gathered for the task. Answer from the code; ask the user only for what you cannot observe.
2. Make the checkout build and start as-is. If it does not, fix it, or report precisely what blocks it, before you generate anything. A skill written against a broken base teaches wrong steps.
3. Generate the skill and its feature map with `create-verification-skill` (`../../create-verification-skill/SKILL.md`). Pass the map and build/startup evidence so generation only fills gaps. Tell the generator that this playbook schedules acceptance in the next step. Use `README.md#executing-implementation-steps` for authored code and helpers.
4. Accept the generated skill using `../../create-verification-skill/references/acceptance.md`. Return defects for correction and reuse evidence that still describes the current artifact.
5. Finish under `README.md#finish-implementation` and deliver the accepted skill with its evidence and limitations.

**Reply:** the surface and the features in the map, the skill's path, the `prove-it` verdict for the proven feature with the evidence path, and anything you could not drive with the prerequisite that blocked it.
