---
name: deslop
description: "Simplify a completed workpackage and its tests without changing behavior. Use after finishing a workpackage."
---

Review the completed workpackage and simplify its implementation without changing its intended behavior.

## Scope

- Focus on code that the workpackage added or affected, and on the nearby code you need to change to simplify that code coherently.
- Do not perform unrelated cleanup.
- Read the affected files in full and understand the relevant invariants, call sites, tests, and public API before editing.
- Optimize for a direct, coherent, maintainable design—not the smallest diff.

## What to remove or simplify

- Remove abstractions that have no clear responsibility or do not reduce real complexity.
- Inline trivial helpers, wrappers, adapters, and pass-through layers when they obscure rather than clarify behavior.
- Remove duplicated logic and put shared behavior at the appropriate existing layer.
- Remove speculative flexibility, configuration, extension points, and generic machinery that have no current requirement.
- Remove speculative defensive programming inside trusted code. Validate at real trust boundaries; rely on types and established invariants internally.
- Do not keep fallback behavior for states that should be impossible. Prefer fixing the invariant or type model.
- Simplify excessive state, boolean flags, branching, indirection, and special cases. Rework the underlying representation when that is clearer.
- Tighten types so invalid states are unrepresentable, where the language allows it. Avoid escape hatches, unnecessary casts, broad types, and optional fields for impossible states.
- Prefer direct, readable code over cleverness, premature abstraction, and framework-like infrastructure.
- Delete comments that merely restate the code, but preserve comments that explain constraints, intent, or non-obvious decisions.

## Tests that copy the implementation

A test should fail when behavior breaks and keep passing when only the internals change. A test that copies the code breaks on every refactor and catches no bugs. Look for:

- mock expectations that repeat internal calls and their order;
- expected values computed with the same algorithm or helper as the code under test;
- assertions that restate a field-by-field mapping with the same names and values as the code;
- assertions on private structure or source text;
- a harmless refactor that forces the same edit across many tests;
- snapshots updated without anyone reading the diff.

These are signs, not proof. A mock, a snapshot, or a call-order check is fine when a requirement calls for it, such as charging only once or checking permissions before a write. For each suspect test, name the requirement it checks, a change that would break it without changing behavior, and a bug it would catch.

Rewrite such a test to call the code the way its users do, and to check results, errors, state changes, and required side effects. Take expected values from the requirement or a worked example, not from the code. Keep the useful checks of a test you rewrite. When practical, introduce a small bug and confirm the test fails, then make a harmless internal change and confirm it passes. Undo only your own temporary edits.

## Approval gate for significant removals

Before you remove anything significant, or anything that may have been kept on purpose, stop and ask the user for approval. First explain:

1. what you propose to remove or change;
2. why it appears unnecessary or overly defensive;
3. what behavior, compatibility, extensibility, validation, or failure handling could be affected;
4. the simpler replacement, if any; and
5. your recommendation.

Wait for explicit approval before applying that change. Do not ask for one approval that covers several independent decisions; present each one separately when their tradeoffs differ.

Treat a decision as significant when it removes or materially changes any of the following:

- user-visible behavior or supported workflows;
- public APIs, persisted formats, protocol behavior, or backward compatibility;
- validation, authorization, security checks, recovery, retries, fallbacks, or error handling;
- an abstraction or extension point that appears deliberate or has multiple consumers;
- functionality covered by tests or documentation;
- code whose purpose or invariant is uncertain.

Routine, behavior-preserving cleanup does not require approval, such as inlining a single-use trivial helper, removing an unreachable branch proven impossible by the type model, or deleting newly added duplication. If uncertain whether a removal is significant, ask.

## Constraints

- Preserve intended behavior unless the user explicitly approves a change.
- Before you remove code because it is unused, check whether it is a public API, an extension point, a generated entry point, or something kept on purpose for compatibility.
- Do not replace clear code with a new abstraction solely to reduce line count.
- Do not weaken tests to permit simplification. Update tests only when an approved behavior change or a cleaner equivalent structure requires it. Do not loosen an assertion, update an expected value just because the output changed, or delete a failing test to make the suite pass. Delete a test only when other tests already cover everything it checks.
- Follow the repository's validation and testing instructions after edits.

## Completion

After editing, review the final diff for avoidable complexity, duplication, indirection, defensive branches, and accidental behavior changes. Report:

- what was simplified, in the code and in the tests;
- which invariants the implementation now relies on;
- any significant removals you did not make because the user did not approve them; and
- the validation performed and its results.

Passing tests and type checks does not finish the work: the affected code must also be easier to understand and change.
