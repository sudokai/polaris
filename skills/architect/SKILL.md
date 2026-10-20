---
name: architect
description: "Sketch types, signatures, and module structure before code, then stay in the loop while implementation fills in. Use for /architect, 'architect this', 'design this', or non-trivial work where jumping to code would lock in the wrong shape."
disable-model-invocation: true
---

# Architect

Sketch types, function signatures, class shapes, and module boundaries with `not implemented` bodies and pseudocode. Scale independent review to the uncertainty and consequences, then fill in code against the chosen sketch.

## Start

Open a todolist with one entry per phase before starting.

1. Ground
2. Sketch
3. Agree
4. Implement
5. Scrap

## Phase A: Ground the problem

Build a real mental model of every system the new code touches. Reuse source-backed grounding from this task; run the `how` skill (`../how/SKILL.md`) only for gaps. Naming a file isn't grounding. If the design redefines ownership or layering, use existing rationale or run the `why` skill (`../why/SKILL.md`) to recover the constraints. Keep the grounding focused on the design decision.

Skip Phase A only when the work is genuinely greenfield with no surrounding system to integrate.

## Phase B: Sketch

Choose the smallest review that addresses the decision. State which path you chose and why. Choose subagent models with `../polaris/references/models.md`.

- **Settled shape:** follow the established design directly. Record the relevant constraints; no competing sketches or design reviewer are needed.
- **Moderate uncertainty:** write one proposal yourself, using `references/runner-prompt.md` and `references/rationale-template.md`. Start one fresh reviewer for `kind: reasoning`, `level: hard` with the task, grounding, proposal's usage sketch, types, signatures, and module map, `references/design-red-flags.md`, and the comparison criteria below. Ask it to challenge the shape, identify a stronger alternative if warranted, and cite concrete risks. Do not pass your rationale until its first pass is complete. Reconcile against the source and record the review and your decision.
- **Consequential commitment:** use two independent designers and a judge as described below. Choose this path for security boundaries, data-loss risks, public compatibility, difficult migrations, or ownership decisions that would be costly to reverse. Also use it when the user requests competing designs.

For the consequential path, start two subagents for `kind: reasoning`. Select `level: hard` or `level: very_hard` according to the unresolved reasoning difficulty. Give each its own worktree or scratch directory and start them at the same time. Give each the design task, the same Phase A grounding, and `references/runner-prompt.md`. Neither sees the other's work. Each produces a design package shaped per `references/rationale-template.md`.

On this path, require two independently produced candidates before synthesis, even when the first looks sufficient. Seek whole-shape alternatives, per [Exhaust the Design Space](../principle-exhaust-the-design-space/SKILL.md). If the two candidates converge on the same shape, record the convergence and skip the graft.

On the consequential path, then start one judge subagent for `kind: reasoning`, selecting `level: hard` or `level: very_hard` according to the reasoning difficulty. It wrote neither sketch. Give it both packages by neutral labels, `references/design-red-flags.md`, and the comparison criteria below. It scores each candidate against each criterion and recommends a base. Reviewers and the judge do not start further agents.

Comparison criteria:

- **Red flags.** Screen every candidate against [`references/design-red-flags.md`](references/design-red-flags.md). Assume the next contributor is an agent that sees only the files it opened, copies the nearest example, and takes the shortest path that compiles. Prefer the design where a change that looks right from one file is right for the whole repo.
- **Interface depth.** Prefer the design that hides more complexity behind a smaller, simpler public surface. A rich interface can keep call chains short by concentrating capability instead of scattering it across layers.
- **Extensibility.** Prefer the design a future maintainer can extend without breaking invariants. When two feel tied, prefer the cleaner boundary or the smaller API, per the [Laziness Protocol](../principle-laziness-protocol/SKILL.md).

When comparing two candidates, read both yourself before accepting the judge's pick. Resolve disagreements against the criteria and rationales. Graft useful ideas from the losing candidate only when they fit one coherent design, per [Redesign from First Principles](../principle-redesign-from-first-principles/SKILL.md). Record the base, verdict, grafts, and rejections in the rationale's "Synthesis decision" section.

If independent review is required but unavailable, report the limitation and ask before substituting self-review. Continue grounding and preparing candidates where useful; separate passes do not satisfy the independence requirement.

## Phase C: Agree (opt-in)

Default: proceed directly to implementation with the synthesized design. No human checkpoint.

Opt in to a checkpoint when the invoker explicitly asks: "/architect with checkpoint," "stop and show me before implementing," or similar. Then surface the synthesized design, drawn with the views of the `show-me` skill (`../show-me/SKILL.md`), and pause for sign-off. If the sketch is a state model or an API, offer a prototype that the user can drive, per the `prototype` skill (`../prototype/SKILL.md`), and build it only on yes.

The synthesis can ship as its own commit either way, as the "scaffold first" mode of [Foundational Thinking](../principle-foundational-thinking/SKILL.md). Planned and scoped breakage during fill-in is fine, per [Outcome-Oriented Execution](../principle-outcome-oriented-execution/SKILL.md).

If the human pushes back on the shape (in a checkpoint or after the fact), treat that as Phase A evidence. Re-ground and re-run Phase B before writing more code.

## Phase D: Implement against the sketch

Replace `not implemented` bodies with code, pseudocode with logic. The synthesized sketch is the contract. Deviations from it are signal to surface, not friction to absorb silently. If a function needs a parameter the sketch didn't anticipate, ask whether the sketch was wrong, the requirement was missed, or the implementation is overreaching.

## Phase E: Scrap when the architecture is wrong

If implementation keeps producing friction the sketch can't absorb, throw the sketch out. Don't bolt fixes onto a wrong design, per [Redesign from First Principles](../principle-redesign-from-first-principles/SKILL.md) and [Fix Root Causes](../principle-fix-root-causes/SKILL.md).

The signal is a *pattern*, not single instances. Tells:

- The same shape of workaround appearing repeatedly across unrelated code.
- Multiple unrelated edge cases that all need special-case branches.
- Types that need escape hatches (`any`, casts, optional fields always set in practice) to compile.
- The "we need a lock" reflex when the sketch said the state wasn't shared.
- Callers having to know the abstraction's internal rules to use it.
- Two or more independent Phase D deviations of the same shape across the implementation.

Use judgment. A few edge cases don't condemn an architecture. Some problems are legitimately complex. Complexity in the data is not complexity in the design.

When you scrap:

1. Re-run the `how` skill (`../how/SKILL.md`) over what's been built.
2. Redesign as if the new constraints had been day-one assumptions, per [Redesign from First Principles](../principle-redesign-from-first-principles/SKILL.md).
3. Subtract before adding, per [Subtract Before You Add](../principle-subtract-before-you-add/SKILL.md). The new sketch should be smaller than the old one before it grows.
4. Return to Phase B and sketch again.

## Outputs

The caller's usage is written first and the type sketch derived from it. One file with new types and signatures for small changes. Module map plus type definitions for larger work. The rationale ships alongside, shaped per `references/rationale-template.md`, including the usage sketch and the synthesis decision.
