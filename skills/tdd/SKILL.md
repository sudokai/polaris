---
name: tdd
description: "Test-driven development with a red-green-refactor loop. Use when the user wants to build features or fix bugs test-first, or wants integration tests."
---

# Test-Driven Development

## Philosophy

Tests verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't. [Test Behavior, Not Implementation](../principle-test-behavior-not-implementation/SKILL.md) is the rule, with the two imagined edits that judge each test. See [mocking.md](mocking.md) for where to mock.

## Anti-Pattern: Horizontal Slices

**DO NOT write all tests first, then all implementation.** This is "horizontal slicing" - treating RED as "write all tests" and GREEN as "write all code."

This produces **weak tests**:

- Tests written in bulk test _imagined_ behavior, not _actual_ behavior
- You end up testing the _shape_ of things (data structures, function signatures) rather than user-facing behavior
- Tests become insensitive to real changes - they pass when behavior breaks, fail when behavior is fine
- You outrun your headlights, committing to test structure before understanding the implementation

**Correct approach**: Vertical slices via tracer bullets. One test → one implementation → repeat. Each test responds to what you learned from the previous cycle. Because you just wrote the code, you know exactly what behavior matters and how to verify it.

```
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  RED→GREEN: test3→impl3
  ...
```

## Workflow

### 1. Planning

Use the project's terms from `GLOSSARY.md` in test names and interfaces, and respect the ADRs in `docs/adr/` for the area you're touching.

Before writing any code:

- [ ] Decide what interface changes are needed
- [ ] List the behaviors to test (not implementation steps), most important first
- [ ] Identify opportunities for [deep modules](deep-modules.md) (small interface, deep implementation)
- [ ] Design interfaces for [testability](interface-design.md)
- [ ] Name the core types and data structures first, per [Foundational Thinking](../principle-foundational-thinking/SKILL.md)

Decide who makes each of these calls per [Never Block on the Human](../principle-never-block-on-the-human/SKILL.md). Internal interfaces and which behaviors to test are yours: decide, state the plan in a few lines, and start. A public API is the user's to judge, so show its sketch first. A change of scope is a product call, so ask.

**You can't test everything.** Focus testing effort on critical paths and complex logic, not every possible edge case.

### 2. Tracer Bullet

Before writing this test and every later one, decide whether it should exist and what it asserts, per the `fix-change-detector-tests` skill (`../fix-change-detector-tests/SKILL.md`).

Write ONE test that confirms ONE thing about the system:

```
RED:   Write test for first behavior → test fails
GREEN: Write minimal code to pass → test passes
```

This is your tracer bullet - proves the path works end-to-end.

### 3. Incremental Loop

For each remaining behavior:

```
RED:   Write next test → fails
GREEN: Minimal code to pass → passes
```

Rules:

- One test at a time
- Only enough code to pass current test
- Don't anticipate future tests
- Keep tests focused on observable behavior
- Make each cycle a unit you can verify and commit on its own, per [Sequence Work into Verifiable Units](../principle-sequence-verifiable-units/SKILL.md)
- When the next steps repeat the same edit, write the script or codemod that makes it, per [Build the Lever](../principle-build-the-lever/SKILL.md)

### 4. Refactor

After all tests pass, look for [refactor candidates](refactoring.md). Remove before you add, per [Subtract Before You Add](../principle-subtract-before-you-add/SKILL.md), and add an abstraction only when it pays for itself, per [Laziness Protocol](../principle-laziness-protocol/SKILL.md):

- [ ] Extract duplication
- [ ] Deepen modules (move complexity behind simple interfaces)
- [ ] Apply SOLID principles where natural
- [ ] Consider what new code reveals about existing code
- [ ] Run tests after each refactor step

**Never refactor while RED.** Get to GREEN first.

When the cycle ends, check the new tests again with the `fix-change-detector-tests` skill.

## Checklist Per Cycle

```
[ ] Test catches a plausible bug that no other test catches
[ ] Test describes behavior, not implementation
[ ] Test uses public interface only
[ ] Test would survive internal refactor
[ ] Code is minimal for this test
[ ] No speculative features added
```
