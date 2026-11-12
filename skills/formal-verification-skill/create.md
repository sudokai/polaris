# Create a formal verification check

## Choose the target

Answer from the code, and ask the user only what you cannot observe. If the user named an area or a bug, start there. Look for a promise the code makes, where a break harms users and tests rarely reach the case that breaks it. Choose the strongest such target, not the one that is easiest to verify.

## Choose the tool

Pick the tool that answers the question at the lowest cost, and tell the user why:

- Whether events can happen in a bad order: a model checker over a small model of the design. TLA+ is the default in any language.
- Whether the code behaves for every input, as with memory safety, overflow, or a data-structure invariant: a verifier that runs on the code. If none runs on this language, say so, and test the real code with generated inputs instead of a hand model of the function.
- A property that must hold at every size, where a bound is not enough: a proof.

Prefer a tool that the repo's developers can install and run.

## Build the check

- **True to the code.** Every part of the model or proof points to code that a reviewer can open. What the verification treats as one indivisible step is one indivisible step in the code. Names come from the repo.
- **Able to fail.** Show each property failing on a broken variant of the code it guards, such as a removed check or a reordered step.
- **Findings stay findings.** When the current code breaks the property, report the counterexample in the code's terms. Do not weaken the property or the model until it passes, and do not change product code unless the user asks.
- **Honest about scope.** A pass covers the model or the bound, not the whole system.
- **Cheap to rerun.** One command, a pinned tool version, and a run short enough that the next agent uses it on every relevant change.

## Write the verify skill

Write a project-local skill in the project skill directory that your harness reads. Give it frontmatter that names the area and says when to use it; without frontmatter, the skill never registers. From the skill alone, the next agent must be able to tell whether a change touches the verified code, run the check, tell a real bug from a modeling error, and update the verification when a change is intended. Include the [coverage record](SKILL.md#coverage-record). Use the repo's real commands, paths, and nouns, and leave no placeholders.

For a TLA+ check, tell the next agent to read each result with the `statechart` skill, which tells each violation as its shortest path in plain words and charts the states when the check passes. Without `statechart`, the agent reads TLC's counterexample trace directly. Name `statechart` only: its commands and paths change between releases, so copy none of them.

## Prove it, then hand off

Follow the verify skill once, as the next agent would, on a scratch change that breaks the property in the real code. It must catch the break. Then drop the scratch change and confirm that the check is back where it started: passing, or failing only on the findings you will report. If the skill misses the break or a step does not run, fix the skill or the verification, not the scratch change.

Tell the user what you verified, which tool you used and why, the bounds, what the check found in plain words, how to run it, and what it does not cover. Suggest a second target only if you found one nearly as strong as the first. Tell the user to run this skill's maintain mode when code that the check covers changes without a recheck.
