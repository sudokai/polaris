---
name: formal-verification-skill
description: "Create or maintain a project-local skill that formally verifies the code where a bug costs the most and tests reach the least, in any language, with the verification tool that fits. Use for \"model-check this race\", \"prove this invariant\", for concurrency, retries, state machines, parsers, or unsafe code that need more than tests, or when code that a formal check covers changed after the check last ran."
disable-model-invocation: true
---

# Formal verification skill

A test checks the cases that someone thought to write. Formal verification checks every case in a stated scope: every order of steps in a model, every input up to a bound, or every input. This skill leaves a project-local verify skill that lets the next agent check a change against a property. Write it for an agent that reads it cold, mid-change. The user must be able to trust the result and act on it without learning the verification language.

Find existing checks by what they do, not by name: a project skill that runs a model checker, a prover, or another verifier against named code. Pick the mode, and say which:

- **Create** when the property has no check yet: follow [create.md](create.md).
- **Maintain** when code that a check covers changed after the check's sync commit, or the user asks whether a check still describes the code: follow [maintain.md](maintain.md).

## Coverage record

Each verify skill keeps this record for each of its checks, under a `Coverage` heading. Both modes read and write it.

- **Property:** the promise and the harm when it breaks, in one plain sentence each.
- **Covers:** the files and functions that the check describes.
- **Scope:** the bounds and assumptions.
- **Run:** the one command that runs the check.
- **Synced at:** the commit at which the verification was last confirmed to describe the code. Move it forward only after you confirm, at the new commit, that the verification still describes the code.
