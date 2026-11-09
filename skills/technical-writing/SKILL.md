---
name: technical-writing
description: Write or review technical documentation, plans, RFCs, READMEs, playbooks, PR descriptions, and commit messages. Structure for the reader, remove ambiguity, and verify technical details.
---

# Technical writing

Write for a specific reader and purpose. Use the project's terminology and follow the document's existing conventions.

## Choose the structure

Decide what the reader needs:

- **To learn:** introduce a working example early. Guide the reader through steps that produce visible results, and explain important concepts when they become relevant.
- **To complete a task:** state the outcome and prerequisites. Give the common procedure first, followed by exceptions, recovery, and limitations.
- **To look up details:** document exact behavior, options, defaults, units, limits, and errors. Derive the reference from source code or schemas when possible.
- **To understand a decision:** state the problem and constraints, compare viable options, name the recommendation, and explain its consequences.

Combine these structures when the document needs more than one. Keep each section focused on one reader goal.

## Write usable procedures

- Number steps when their order matters. Give one action per step and use direct commands.
- Put a condition before the action it controls: "If the service is running, stop it before replacing the binary."
- Use real paths, commands, symbols, settings, and realistic input. Show the expected result when the reader needs to confirm success.
- Include required permissions, inputs, and environmental assumptions before the steps that depend on them.
- Keep warnings next to the actions they affect. Explain the consequence and the way to avoid it.

## Be specific

- State concrete consequences, not general risks. Write "renaming a column fails the build", not "schema changes can cause issues".
- When you weigh tradeoffs, state your conclusion and its reason instead of only listing pros and cons. Keep reference material neutral.

## Remove ambiguity

- Use one term for each concept. Repeat an established code name instead of substituting a near-synonym.
- Place "only" and "not" next to the word they modify. Compare "retry only after a timeout" with "only retry after a timeout".
- Replace unclear uses of "this", "it", or "they" with the noun they name.
- Keep articles and verbs needed to parse the sentence. Split long noun chains into phrases that show the relationships.
- State who performs an action when the actor matters. Use "the scheduler retries the request", not "the request is retried".
- Distinguish observed facts from recommendations. State uncertainty when behavior is unverified or version-dependent.

## Verify the document

Read from the intended reader's starting point and confirm that the instructions work in the stated order.

Check commands, paths, symbols, defaults, and examples against the current project. Run commands and examples that claim to work, and compare their actual output with the documented result.

For generated trees, inventories, and counts, record the command that produces them. Mark facts that remain unverified instead of guessing.
