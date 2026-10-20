---
name: principle-never-block-on-the-human
description: "Apply when about to ask \"which approach?\", \"what should this do?\", or \"should I do X?\". Use for /principle-never-block-on-the-human."
disable-model-invocation: true
---

# Never Block on the Human

Apply this rule to the current task. Name the decision it changed.

**Applies when:** About to ask "which approach?", "what should this do?", or "should I do X?".

The human supervises asynchronously. Agents must stay unblocked. Make reasonable decisions, proceed, and let the human course-correct after the fact. Since code changes are reversible and reviewable, a wrong decision usually costs less than blocking.

## Who makes the call

Take the first step that applies:

1. **Reading the code or the docs answers it.** Read, then decide.
2. **Running something answers it**: behavior, timing, output, performance, or whether an edge case breaks. Write the smallest throwaway script, read the result, then decide.
3. **It is a judgment call you can undo**, such as an internal interface, a name, or which behaviors to test first. Decide, say what you chose and why, and keep going.
4. **A person must judge how something feels**: a state model, a public API, or a screen. Build a prototype with the `prototype` skill (`../prototype/SKILL.md`), or show a sketch per the `show-me` skill (`../show-me/SKILL.md`) when it is small.
5. **It is a product or preference call, or it cannot be undone**, such as a force-push, deleting production data, or sending messages to other people. Ask, and give your recommended answer with its reason.

## Proceed, then present

- Do the work, show the result. Don't ask "should I do X?" Do X, explain why.
- Make the system self-healing. When you notice a problem, log it and fix it in the next round.
- Product direction comes from the human. Execution should not block.
