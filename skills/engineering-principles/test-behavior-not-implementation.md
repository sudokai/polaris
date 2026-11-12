# Test Behavior, Not Implementation

A test is a claim about what the code does for its users: a caller, an end user, or another service. Behavior is what those users can observe through the interface they use. That includes return values, errors, state they can read back, and effects on systems outside the code, such as a request sent, a row written, or a message emitted. Implementation is what they cannot observe: private helpers, internal call order, intermediate data, and which internal collaborator did the work.

## Decide whether the test should exist

Write a test only if it checks a stated requirement and would catch a plausible bug that no existing test catches. Writing no test is a valid outcome. You meet a rule such as "add tests with every feature" by testing the new behavior that makes a decision. When no new code makes a decision, say so instead of adding a test to satisfy the rule.

Don't test code that makes no decision: no branch, calculation, ordering, or error case. Such a test takes its expected values from the code itself, so it fails only when someone edits the code, and then they edit the test to match. Test the code that builds the value or decides when to use it instead. A fixed value does deserve a test when something outside the code defines it, such as a published format or protocol. Cite that source and take the expected values from it.

## Judge the test

Judge each test against two imagined edits:

- **Break the behavior.** Make the code return a wrong value, skip an effect, or do the effect twice. If the test still passes, it proves nothing. The usual causes are an assertion looser than the contract, an expected value computed by the code under test, a test that restates a constant or prompt string without running the code that reads it, and an assertion on data that the test built itself.
- **Change the internals.** Keep every observable result the same and restructure the code underneath. If the test now fails, it is pinned to the implementation. It will need a rewrite on every refactor and still catches no bug.

Keep a test that catches the first edit and survives the second. Rewrite or delete the rest. To write a test that does both, drive the code through its users' interface with a concrete input. Derive the expected value from the requirement, not from a run of the code. Assert what the contract promises, no less and no more.

The contract decides, not the shape of the assertion. When "an empty cart never charges" is the promise, an assertion that the payment client got no call is behavior. Pair it with a case where the charge happens, so that the test shows it can see a call. The payload that a mocked external service receives is behavior, because that service observes it. A call to an internal helper is implementation, because no user can see it. Asserting an empty list checks the exact answer when no record matches, but it is a hollow check when the test only needs some result. An exact error message pins wording that no caller reads. The error type that callers branch on is the contract.

A test can pin an invariant instead of a call, such as a key that must exist in two tables or a compile-time type check. The invariant is the behavior.

## Don't weaken tests to get them passing

- Don't replace an exact assertion with "not null" or "did not throw".
- Don't update an expected value or a snapshot just because the output changed. Check first that the new output is correct.
- Don't delete a failing test to make the suite pass. Delete a test only when it checks nothing that other tests miss, or after adding a test that covers the same behavior.
