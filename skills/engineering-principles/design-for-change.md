# Design for Change

Judge code by how easily it can change, not only by how well it reads today. A small change in requirements can make the most elegant code fall apart.

Good code is easy to understand, hard to misuse, correct, and fast. Great code stays that way as it changes. The principle applies to any module: a function, a class, a component, a service, a config format, or an API.

Before you settle a design, list the edits the code will likely need, and check that each one is easy to make:

- Move part of it, or copy and paste it somewhere else
- Rename something
- Merge special cases into one reusable helper, or split a helper back into special cases
- Add a quick hack
- Optimize a slow path
- Throw part of it away and start again
- Make a mistake, then find and fix it
- Trace an effect back to its cause
- Review the fix

Prefer the design where each edit stays small and local, and where a mistake is easy to spot. If an edit forces changes far from the code you meant to touch, or requires knowing something the code doesn't show, change the design.
