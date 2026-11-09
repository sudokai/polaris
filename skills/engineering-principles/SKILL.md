---
name: engineering-principles
description: "Index of engineering principles for design, coding, testing, debugging, and delegation decisions. Use before such a decision to find the principles that apply, then read and apply only those."
---

# Engineering principles

Each line below names the situation a principle governs. Match the lines against your current work, read each matching principle file in full, and apply it. Do not read the others. If the user names a principle, read that one.

When you finish, end your reply with one line per principle that changed a decision: its name and the decision it changed, such as "model-the-domain: used a state machine instead of two booleans." Leave out principles that changed nothing. Cite only principles whose file you read in this session.

## Core

- Refactoring, sizing a diff, or tempted to add an abstraction, a layer, or signal threading → [laziness-protocol](laziness-protocol.md)
- Before writing logic: choosing core types and data structures, ordering scaffolding before features, or deciding what concurrent actors share → [foundational-thinking](foundational-thinking.md)
- Fitting a new requirement into an existing design → [redesign-from-first-principles](redesign-from-first-principles.md)
- Two or more fixes that rest on the same premise have failed the same check → [attack-the-premise](attack-the-premise.md)
- Ordering an addition, a refactor, or a rewrite → [subtract-before-you-add](subtract-before-you-add.md)
- Reviewing or shaping code that is hard to trace → [minimize-reader-load](minimize-reader-load.md)
- A planned rewrite or migration with explicit phase boundaries → [outcome-oriented-execution](outcome-oriented-execution.md)
- Product, UX, or feature-scope tradeoffs → [experience-first](experience-first.md)
- A new interaction or architectural decision with no precedent in the codebase → [exhaust-the-design-space](exhaust-the-design-space.md)
- Nontrivial edits, migrations, analyses, or checks that a script, codemod, or generator could do or prove → [build-the-lever](build-the-lever.md)

## Architecture

- Stateful logic, or code that branches a lot or repeats a data-shape assumption across files → [model-the-domain](model-the-domain.md)
- Wiring validation, error handling, or framework adapters → [boundary-discipline](boundary-discipline.md)
- Designing types or a function signature in a statically typed language → [type-system-discipline](type-system-discipline.md)
- Commands, lifecycle steps, or loops that must survive crashes, restarts, and retries → [make-operations-idempotent](make-operations-idempotent.md)
- Introducing a new internal API while callers of the old one still exist → [migrate-callers-then-delete-legacy-apis](migrate-callers-then-delete-legacy-apis.md)
- Concurrent actors might write the same file, branch, key, or object → [separate-before-serializing-shared-state](separate-before-serializing-shared-state.md)

## Verification

- About to declare a task done → [prove-it-works](prove-it-works.md)
- Debugging → [fix-root-causes](fix-root-causes.md)
- Multi-step work, such as sweeps, migrations, or runs of similar edits, and the order of commits and pull requests → [sequence-verifiable-units](sequence-verifiable-units.md)
- Writing, changing, or keeping a test → [test-behavior-not-implementation](test-behavior-not-implementation.md)
- About to measure, or to trust, report, or act on a measured number such as a speedup, a latency, or an eval result → [explain-the-number](explain-the-number.md)

## Delegation

- Large outputs, long files, repeated reads, or planning a fan-out to subagents → [guard-the-context-window](guard-the-context-window.md)
- About to ask the user which approach to take, what something should do, or whether to do it → [never-block-on-the-human](never-block-on-the-human.md)

## Meta

- A mistake recurs, or you are about to write an instruction to prevent a future failure → [encode-lessons-in-structure](encode-lessons-in-structure.md)
