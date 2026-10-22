---
name: architect
description: "Design and review substantial program, system, product, or codebase foundations: types, interfaces, ownership, and modules. Return the design and revise it when evidence shows it no longer fits. Use for /architect, 'architect this', or 'design this', even when the approach seems clear."
disable-model-invocation: true
---

# Architect

Sketch types, function signatures, classes, and module boundaries with `not implemented` bodies and pseudocode. Choose independent review based on uncertainty and consequences. Return the design to the user or coordinating agent, which continues any further work requested.

Use this skill for any substantial body of work involving program, system, or product design, including foundational types, interfaces, ownership, and module structure. Scope and design significance determine when to use it; uncertainty and consequences determine the independent review needed. A clear approach still needs deliberate design. Reuse an existing design when it covers the work; routine implementation within that design does not need another design round.

## Start

Open a todolist with one entry per phase before starting.

1. Ground
2. Sketch
3. Agree
4. Hand off
5. Revisit when needed

## Phase A: Ground the problem

Build a real mental model of every system the new code touches. Reuse source-backed grounding from this task; run the `how` skill only for gaps. Naming a file isn't grounding. If the design redefines ownership or layering, use existing rationale or run the `why` skill to recover the constraints. Keep the grounding focused on the design decision.

Skip Phase A only when the work is genuinely greenfield with no surrounding system to integrate.

For product, UX, or feature-scope tradeoffs, define the intended experience per `principle-experience-first`.

## Phase B: Sketch

Choose core data structures before logic per `principle-foundational-thinking`.

When designing state or ownership, choose structures that encode domain rules per `principle-model-the-domain`.

Use `model-domain` when domain relationships, invariants, state transitions, or ownership need clarification. Reuse an existing source-backed model when it covers the design.

When designing types and signatures, make invalid states unrepresentable per `principle-type-system-discipline`.

When designing validation, error handling, or framework adapters, place them per `principle-boundary-discipline`.

Choose the smallest review that addresses the decision. State which path you chose and why. Choose subagent models with [model budgets](../polaris/references/models.md).

- **Settled shape:** ground and document the design, including the caller's usage, types, interfaces, and module boundaries relevant to the work. Reuse an existing sketch where it covers these decisions. No competing sketches or design reviewer are needed.
- **Moderate uncertainty:** write one proposal yourself, using [design prompt](references/runner-prompt.md) and [rationale template](references/rationale-template.md). Start one fresh reviewer for `kind: reasoning`, `level: hard` with the task, grounding, proposal's usage sketch, types, signatures, and module map, [design red flags](references/design-red-flags.md), and the comparison criteria below. Ask it to challenge the shape, identify a stronger alternative if warranted, and cite concrete risks. Do not pass your rationale until its first pass is complete. Reconcile against the source and record the review and your decision.
- **Consequential commitment:** use two independent designers and a judge as described below. Choose this path for security boundaries, data-loss risks, public compatibility, difficult migrations, or ownership decisions that would be costly to reverse. Also use it when the user requests competing designs.

For the consequential path, start two subagents for `kind: reasoning`. Select `level: hard` or `level: very_hard` according to the unresolved reasoning difficulty. Give each its own worktree or scratch directory and start them at the same time. Give each the design task, the same Phase A grounding, and [design prompt](references/runner-prompt.md). Neither sees the other's work. Each produces a design package shaped per [rationale template](references/rationale-template.md).

On this path, require two independently produced candidates before synthesis, even when the first looks sufficient. Seek whole-shape alternatives, per `principle-exhaust-the-design-space`. If the two candidates converge on the same shape, record the convergence and skip the graft.

On the consequential path, then start one judge subagent for `kind: reasoning`, selecting `level: hard` or `level: very_hard` according to the reasoning difficulty. It wrote neither sketch. Give it both packages by neutral labels, [design red flags](references/design-red-flags.md), and the comparison criteria below. It scores each candidate against each criterion and recommends a base. Reviewers and the judge do not start further agents.

Comparison criteria:

- **Red flags.** Screen every candidate against `references/design-red-flags.md`. Assume the next contributor is an agent that sees only the files it opened, copies the nearest example, and takes the shortest path that compiles. Prefer the design where a change that looks right from one file is right for the whole repo.
- **Interface depth.** Prefer the design that hides more complexity behind a smaller, simpler public surface. A rich interface can keep call chains short by concentrating capability instead of scattering it across layers.
- **Extensibility.** Prefer the design a future maintainer can extend without breaking invariants. When two feel tied, prefer the cleaner boundary or the smaller API, per the `principle-laziness-protocol`.

When comparing two candidates, read both yourself before accepting the judge's pick. Resolve disagreements against the criteria and rationales. Graft useful ideas from the losing candidate only when they fit one coherent design. Record the base, verdict, grafts, and rejections in the rationale's "Synthesis decision" section.

If independent review is required but unavailable, report the limitation and ask before substituting self-review. Continue grounding and preparing candidates where useful; separate passes do not satisfy the independence requirement.

## Phase C: Agree (opt-in)

Return the design without a checkpoint unless requested. If the user also requested implementation, the invoking agent continues directly or through a playbook. Otherwise, stop at the design.

Opt in to a checkpoint when the invoker explicitly asks: "/architect with checkpoint," "stop and show me before implementing," or similar. Then surface the synthesized design, drawn with the views of the `show-me` skill, and pause for sign-off. If the sketch is a state model or an API, offer a prototype that the user can drive, per the `prototype` skill, and build it only on yes.

The sketch may be a separate scaffold commit per `principle-foundational-thinking`. Whoever implements it declares planned breakage and runs the implementation checks.

If the human pushes back on the shape (in a checkpoint or after the fact), treat that as Phase A evidence. Re-ground and re-run Phase B before handing back another design.

## Phase D: Hand off the design

Return the sketch, rationale, constraints, invariants, open questions, and first implementation step. State which review ran and its limits. Treat the design as the implementation contract. Preserve choices whose lost rationale could cause harmful changes or repeated investigation with `record-architecture-decision`.

If implementation needs an unexpected parameter or other deviation, inspect the mismatch. Decide whether the design missed a requirement, constraints changed, or implementation exceeds scope. Revise the design when needed and explain why.

## Phase E: Revisit when the architecture is wrong

If implementation keeps producing friction the sketch can't absorb, throw the sketch out. Don't bolt fixes onto a wrong design, per `principle-redesign-from-first-principles` and `principle-fix-root-causes`.

The signal is a *pattern*, not single instances. Tells:

- The same shape of workaround appearing repeatedly across unrelated code.
- Multiple unrelated edge cases that all need special-case branches.
- Types that need escape hatches (`any`, casts, optional fields always set in practice) to compile.
- The "we need a lock" reflex when the sketch said the state wasn't shared.
- Callers having to know the abstraction's internal rules to use it.
- Two or more independent deviations of the same shape across the implementation.

Use judgment. A few edge cases don't condemn an architecture. Some problems are legitimately complex. Complexity in the data is not complexity in the design.

When you scrap:

1. Re-run the `how` skill over what's been built.
2. Redesign as if the new constraints had been day-one assumptions, per `principle-redesign-from-first-principles`.
3. Subtract before adding, per `principle-subtract-before-you-add`. The new sketch should be smaller than the old one before it grows.
4. Return to Phase B and sketch again.

## Outputs

The caller's usage is written first and the type sketch derived from it. One file with new types and signatures for small changes. Module map plus type definitions for larger work. The rationale ships alongside, shaped per [rationale template](references/rationale-template.md), including the usage sketch and the synthesis decision.
