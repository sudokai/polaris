---
name: no-change-detector-tests
description: Decide whether a new test should exist and what it asserts, and find and replace tests that copy implementation details instead of checking behavior. Use before writing a new test, after writing or changing tests, when refactors require mechanical test updates, mock expectations break too easily, or the user asks to find change-detector tests or improve test value.
---

# Change-detector tests

Tests should catch bugs, not just changes to the code. A change-detector test copies how the code works without a requirement that explains why those details matter. `principle-test-behavior-not-implementation` is the rule. This skill is the procedure for applying it to a test before you write it and to tests that already exist.

## Before writing a new test

Answer the four questions in step 2 for the test you are about to write. Write it only if it checks a stated requirement and would catch a plausible bug that no existing test catches. Then write it as step 3 describes, and check it as step 4 describes.

## Workflow for existing tests

### 1. Find the expected behavior

- Read the tests, the code they test, and relevant requirements, documentation, or callers.
- If tests fail after a refactor, read the diff before assuming behavior is unchanged. A changed API or side effect may explain the failure.
- State what should happen for a given input and context. Do not base this only on what the code currently does.
- If the expected behavior is unclear, say what needs to be decided. Do not turn an implementation detail into a requirement.
- When reviewing, report findings without editing. When fixing tests, stay within the requested scope.
- Before editing, run the affected tests when possible. Record existing failures.

### 2. Find assertions that copy the code

Look for these patterns, but do not assume they make a test useless:

- Mock expectations repeat internal calls and their order.
- Expected values use the same algorithm or helper as the code being tested.
- Assertions check private structure or source text without a requirement to do so.
- A harmless refactor requires the same edit across many tests.
- Snapshots are updated without checking what the differences mean.

For each suspect test, answer:

1. What requirement does the assertion check? Cite the evidence, or say it is unknown.
2. What change could leave behavior intact but break the test?
3. What plausible bug would the test catch?
4. Does the expected result come from a requirement or from copying the code?

Classify the test and point to the assertions that explain your choice:

- **Behavioral:** Checks required behavior using independently justified expectations.
- **Mixed:** Combines useful behavior checks with assertions that copy implementation details.
- **Change detector:** Copies implementation details without checking required behavior.
- **Uncertain:** There is not enough evidence to establish the required behavior.

A test that breaks during refactors may still catch real bugs.

### 3. Test the required behavior

- Assert results, state changes, errors, or required side effects instead of internal steps.
- Base expected values on concrete examples, requirements, or rules justified independently of the code. Do not repeat the production algorithm to calculate the answer.
- Use real dependencies or small fakes when practical. Use mocks when a real dependency would be unsafe, slow, or unpredictable.
- Check call counts or ordering when required, such as charging only once or checking authorization before a write.
- Keep useful behavior checks when removing assertions about implementation details.
- If setup is repetitive, consider a fixture or builder. Keep important inputs visible. Shorter setup does not mean better coverage.
- Delete a test only if it checks no required behavior that other tests miss, or after adding replacement coverage. If requirements are unclear, preserve useful tests that record existing behavior. Do not delete a failing test just to make the suite pass.

**Example:** A processor test checks that validation and storage stages run in order. If the requirements say invalid work must be rejected without saving, check that invalid input produces the expected error and leaves storage unchanged. For valid input, check that storage contains the expected record. If call order itself is required, keep the order assertion and document why.

### 4. Check that the tests catch bugs and survive refactors

1. Run the replacement tests and related tests.
2. When practical, temporarily introduce a small bug and confirm that the replacement test fails for the expected reason.
3. When practical, make a change that leaves behavior intact and confirm that the test still passes.
4. Undo only your temporary changes and rerun the affected tests. Preserve unrelated user work.

Keep these checks safe and local. If you cannot run one, describe how you would check it and say it remains unverified. A passing test alone does not show that it catches bugs.

## Guardrails

- Mocks, snapshots, interaction tests, and exact-value assertions are not automatically change detectors. Check what requirement they test.
- Do not replace precise assertions with “not null” or “did not throw.”
- Do not update expected values or snapshots just because production output changed. First check whether the new output is correct.
- Do not turn a focused test fix into an architectural rewrite without agreement.

## Report

Keep the report short:

- **Test:** Path, name, classification, and the assertion in question.
- **Reason:** The requirement, a harmless change that would break the test, and a bug it should catch.
- **Action:** Keep, rewrite, remove duplicate coverage, or clarify the requirement.
- **Validation:** Commands and results, including bug and refactor checks run or skipped.

## Source

Adapted from Alex Eagle’s [Testing on the Toilet: Change-Detector Tests](https://testing.googleblog.com/2015/01/testing-on-toilet-change-detector-tests.html), Google Testing Blog, January 2015.

The article explains the difference between tests that check behavior and tests that duplicate implementation details. This skill adds a workflow, classifications, verification steps, and guardrails for coding agents.
