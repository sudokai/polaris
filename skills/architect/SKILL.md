---
name: architect
description: "Sketch types, signatures, and module structure before code, then stay in the loop while implementation fills in. Use for /architect, 'architect this', 'design this', or non-trivial work where jumping to code would lock in the wrong shape."
disable-model-invocation: true
---

# Architect

Design before implementing. Sketch types, function signatures, class shapes, and module boundaries with `not implemented` bodies and pseudocode. Synthesize across multiple model perspectives, then fill in code against the chosen sketch. If implementation proves the sketch wrong, throw it out and redesign.

## Start

Open a todolist with one entry per phase before starting.

1. Ground
2. Sketch
3. Agree
4. Implement
5. Scrap

## Phase A: Ground the problem

Build a real mental model of every system the new code touches. Run the `how` skill (`../how/SKILL.md`) over the relevant subsystems.

Naming a file isn't grounding. Produce the traced model `how` prescribes. If the design redefines ownership or layering, also run the `why` skill (`../why/SKILL.md`) on the existing shape so the rationale becomes a constraint, not a guess.

Skip Phase A only when the work is genuinely greenfield with no surrounding system to integrate.

## Phase B: Sketch

Design it twice. Start two subagents on the `deep` role at the same time, each in its own worktree or scratch directory, and give each the design task, the Phase A grounding, and `references/runner-prompt.md` as its prompt. Neither sees the other's work. Each produces a design package shaped per `references/rationale-template.md`. Choose their models with `../polaris/references/models.md`.

Require at least two structurally distinct candidates before synthesis, even when the first looks sufficient. This is [Exhaust the Design Space](../polaris/principles/exhaust-the-design-space.md) made concrete. Whole-shape alternatives, not point fixes inside one shape. If the two candidates converge on the same shape, record the convergence as a strong signal and skip the graft.

Then start one judge subagent on the `ultra` role. It wrote neither sketch. Give it both packages by neutral labels, `references/design-red-flags.md`, and the comparison criteria below. It scores each candidate against each criterion and recommends a base.

Comparison criteria:

- **Red flags.** Screen every candidate against [`references/design-red-flags.md`](references/design-red-flags.md). Assume the next contributor is an agent that sees only the files it opened, copies the nearest example, and takes the shortest path that compiles. Prefer the design where a change that looks right from one file is right for the whole repo.
- **Interface depth.** Prefer the design that hides more complexity behind a smaller, simpler public surface. A rich interface can keep call chains short by concentrating capability instead of scattering it across layers.
- **Extensibility.** Prefer the design a future maintainer can extend without breaking invariants. When two feel tied, prefer the cleaner boundary or the smaller API, per the [Laziness Protocol](../polaris/principles/laziness-protocol.md).

Read both candidates yourself before you accept the judge's pick. If you disagree with the judge, one of you is biased or the criteria were ambiguous, so read both rationales again before deciding. Graft the one or two strongest ideas from the losing candidate into the base by hand, keeping one coherent mental model, per [Redesign from First Principles](../polaris/principles/redesign-from-first-principles.md). Record the base, the judge's verdict, the grafts, and the rejections in the rationale's "Synthesis decision" section.

If the harness has no subagents, write the two sketches yourself as separate passes, the second deliberately different in shape, and judge them against the criteria. Say that the sketches were not independent.

## Phase C: Agree (opt-in)

Default: proceed directly to implementation with the synthesized design. No human checkpoint.

Opt in to a checkpoint when the invoker explicitly asks: "/architect with checkpoint," "stop and show me before implementing," or similar. Then surface the synthesized design and pause for sign-off.

The synthesis can ship as its own commit either way, as the "scaffold first" mode of [Foundational Thinking](../polaris/principles/foundational-thinking.md). Planned and scoped breakage during fill-in is fine, per [Outcome-Oriented Execution](../polaris/principles/outcome-oriented-execution.md).

If the human pushes back on the shape (in a checkpoint or after the fact), treat that as Phase A evidence. Re-ground and re-run Phase B before writing more code.

## Phase D: Implement against the sketch

Replace `not implemented` bodies with code, pseudocode with logic. The synthesized sketch is the contract.

Deviations from the sketch are signal worth surfacing, not friction to absorb silently. If a function needs a parameter the sketch didn't anticipate, ask whether the sketch was wrong, the requirement was missed, or the implementation is overreaching.

## Phase E: Scrap when the architecture is wrong

If implementation keeps producing friction the sketch can't absorb, throw the sketch out. Don't bolt fixes onto a wrong design, per [Redesign from First Principles](../polaris/principles/redesign-from-first-principles.md) and [Fix Root Causes](../polaris/principles/fix-root-causes.md).

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
2. Redesign as if the new constraints had been day-one assumptions, per [Redesign from First Principles](../polaris/principles/redesign-from-first-principles.md).
3. Subtract before adding, per [Subtract Before You Add](../polaris/principles/subtract-before-you-add.md). The new sketch should be smaller than the old one before it grows.
4. Return to Phase B and sketch again.

## Outputs

The caller's usage is written first and the type sketch derived from it. One file with new types and signatures for small changes. Module map plus type definitions for larger work. The rationale ships alongside, shaped per `references/rationale-template.md`, including the usage sketch and the synthesis decision.
