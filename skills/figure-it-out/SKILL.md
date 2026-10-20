---
name: figure-it-out
description: "Design a playbook when none fits a migration, multi-part change, or other task needing coordination. Define steps and checks, then execute under the shared playbook rules when authorized. Use for /figure-it-out or 'figure it out'."
disable-model-invocation: true
---

# Figure it out

Design a playbook when no bundled or local one fits, using `../polaris/playbooks/README.md` for its format and execution rules. Reuse an existing playbook when it fits, regardless of task size.

## 1. Define the task

Check the Playbooks index in `../polaris/SKILL.md` and local playbooks in `../polaris/references/locations.md`. Consult relevant principles without restarting routing. Reuse source evidence; use `how` (`../how/SKILL.md`) for gaps. State:

- The outcome and a falsifiable completion condition, per [Prove It Works](../principle-prove-it-works/SKILL.md).
- Scope, constraints, rough units of work, and blockers.
- The risks, uncertainties, required independent review, and evidence needed for each phase.

Before a multi-hour run, present the scope and approach at one checkpoint. Reuse existing approval. Make reversible engineering decisions per [Never Block on the Human](../principle-never-block-on-the-human/SKILL.md).

## 2. Design the playbook

Give each numbered step an outcome, method or skill, inputs, and required evidence. State what passes between steps and what the final reply must show.

- Investigate the most serious unknown first. Establish checks and capture baselines before changing behavior. Put foundations before features per [Foundational Thinking](../principle-foundational-thinking/SKILL.md).
- Include `architect` (`../architect/SKILL.md`) for substantial program, system, product, or foundational design. Reuse a design that covers the work; do not schedule competing designs for routine implementation per [Laziness Protocol](../principle-laziness-protocol/SKILL.md).
- Prefer a rerunnable tool to manual or delegated execution when it can do or prove the work, per [Build the Lever](../principle-build-the-lever/SKILL.md).
- Delegate parallel work only when assignments can proceed independently. Give each worker its own worktree or scratch directory per [Separate Before Serializing Shared State](../principle-separate-before-serializing-shared-state/SKILL.md). For delegated implementation, assign an independent reviewer using `../polaris/references/models.md` and state what evidence to inspect. Do not add a reviewer solely for read-only extraction.
- Define verifiable units and any planned migration boundaries. Require `decision-log` (`../decision-log/SKILL.md`) at the full level and use the shared implementation and completion rules instead of copying them.
- Define final checks on the actual result with `prove-it` (`../prove-it/SKILL.md`). Include prevention for recurring mistakes only within scope, per [Encode Lessons in Structure](../principle-encode-lessons-in-structure/SKILL.md).

Save the playbook with the task's working files under an unused descriptive name. Preserve existing plans and make links resolve from the saved file. Do not install it as a permanent playbook or add it to the bundled index.

## 3. Hand off for execution

For planning-only requests, return the playbook and open decisions, then stop. When execution is authorized, follow the playbook under `../polaris/playbooks/README.md` with a full-level decision log. If evidence requires a different sequence, revise the remaining steps and log why.

**Output:** the playbook path, scope, review requirements, inputs and outputs between phases, completion checks, and open product choices. For execution, follow its reply requirements, including the full-level decision-log review.
