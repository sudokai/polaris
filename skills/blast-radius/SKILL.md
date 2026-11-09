---
name: blast-radius
description: "Find what a change could break outside the diff, and check each suspected break by running real code. Use for 'blast radius of X', 'what could this break', or a small diff you don't trust."
---

# Blast radius

Find what a change could break outside the files it touches. Check the serious failure cases instead of presenting every possibility as a bug.

Start with direct callers, then inspect the dependencies that a symbol search misses when they are relevant to the change:

- The source and installed version of libraries the change relies on, including local patches.
- Code that runs asynchronously or during cleanup, such as microtasks, unmount handlers, and teardown routines.
- Data that other components or programs read, including database columns, API responses, and wire formats.
- Feature flags and callers further down the call chain.

For each relevant dependency, identify how the change could make it fail and cite the source with a real `file:line` reference. If a search finds no callers, report that result. Do not invent a caller or an API to fill the gap.

Shared assumptions can reveal related failure cases. Do not assume that one successful test clears every case that depends on the same assumption. Check for inputs or execution paths that treat the assumption differently.

Try to reproduce each serious failure with the real code. For a library problem, import the version that the application loads. For a problem at a data or process boundary, run the data through that boundary. Do not replace the part under investigation with a mock that already returns the expected result. Use `prove-it` to get a verdict on what the result supports.

A passing test clears only the inputs and code path it ran. Report confirmed failures with their source references and reproduction evidence. Keep possible failures that you did not test separate from confirmed failures, and state what each test covered.
