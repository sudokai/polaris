# Maintain a formal verification check

When the code changes and its verification does not, the check can keep passing while it describes code that no longer exists. That pass is the dangerous case, because it looks like a proof.

## Outcome

Give each check one:

- **in sync:** no change since the sync commit alters what the check describes, and the check passes.
- **updated:** the verification now describes the new code, and the check passes.
- **bug:** the verification describes the current code, and the code breaks the property.
- **blocked:** the check could not be brought back in line or could not run. Say why.

A check can be both updated and bug.

Edit only the verification: models, harnesses, property files, and the verify skill. Do not edit product code unless the user asks. Never weaken a property or a model to make a check pass.

## Pass

1. **Read the coverage record** of each check, or of the check the user named. If a check has no sync commit, use the last commit that changed its verification files, and say so.
2. **Run each check as it is,** before you change anything, and record the result. A pass only means that the old description still holds. Do not judge a failure yet.
3. **Read every change to covered code** from the sync commit to now, with its commit message. Follow covered code that was renamed, split, or moved, and new code that touches the state a check guards. Sort each change:
   - **No effect** on anything the verification describes. Check this against the model or harness, not the commit message.
   - **The verification no longer describes the code:** a step split in two, a branch added or removed, a check moved, a new path to the guarded state, or a new range of values. The model or harness must change.
   - **The promise changed on purpose,** and the doc comment, the tests, the changelog, or the commit message says so. The property must change; cite that evidence.
   - **The promise may be broken:** the code changed, and nothing says the promise did. A failure that follows is a bug candidate.
4. **Update from the code, not from the result.** Write the update before you rerun, keeping each indivisible step in the code as one step in the verification. Change a property only for a promise that changed on purpose, and record its old wording, its new wording, and the evidence. Keep the bounds unless the change makes them wrong, and report any reduction.
5. **Rerun and judge each result.**
   - **Pass:** break the new code the way the property guards against, confirm that the check catches it, then drop the break.
   - **Fail:** replay the counterexample against the real code, step by step. If a step cannot happen in the code, the verification is wrong: fix it, and say what was wrong. If every step can happen, it is a bug: name the commit that introduced it, tell the steps in the code's words, and state the harm in one sentence. A cheap reproduction against the real code goes in the report, not in the product code.
6. **Update the coverage record.** Set the sync commit to the commit you checked, except for a blocked check. Then follow the verify skill once, as the next agent would, to confirm that its steps still run.

## Report

For each check, give the outcome and the commits you read, each change to the verification and its reason, the rerun result and the break that showed the check can still fail, and what the verification still does not cover. Tell each bug as steps in the code's words, its harm, and the commit that introduced it. Say which failures were drift in the verification and which were bugs in the code. When a check passed before the update and fails after it, say that the old pass was on a stale description.

Put the verification updates in a change of their own, separate from any product fix.
