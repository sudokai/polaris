---
name: blast-radius
description: "Find what a change could break outside the diff, and check each suspected break by running real code. Use for 'blast radius of X', 'what could this break', or a small diff you don't trust."
---

# Blast radius

Find what a change could break outside the files it touches. Work in two phases: first list the risks, then try to disprove each one by running real code. Do not present every possibility as a bug.

## 1. List the risks

Start with direct callers, then inspect the dependencies that a symbol search misses when they are relevant to the change:

- The source and installed version of libraries the change relies on, including local patches.
- Code that runs asynchronously or during cleanup, such as microtasks, unmount handlers, and teardown routines.
- Data that other components or programs read, including database columns, API responses, and wire formats.
- Feature flags and callers further down the call chain.

For each risk, state how the change could make it fail and cite the source with a real `file:line` reference. If a search finds no callers, report that result. Do not invent a caller or an API to fill the gap.

Note when several risks rest on the same assumption. A check that clears one of them does not clear the others unless it runs the same inputs and code path.

## 2. Try to disprove each risk

For each serious risk, run the real code under the conditions that would cause the failure. For a library problem, import the version that the application loads. For a problem at a data or process boundary, run the data through that boundary. Do not replace the part under investigation with a mock that already returns the expected result. Use `prove-it` to get a verdict on what the result supports.

A risk you could not disprove stays a risk. A passing check clears only the inputs and code path it ran.

## Report

- **Confirmed failures:** the source reference and the reproduction evidence.
- **Cleared risks:** what each check ran, and so what it rules out.
- **Untested risks:** why each was not tested, and the cheapest check that would settle it.
