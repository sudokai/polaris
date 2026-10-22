---
name: define-domain-language
description: Clarify a project's domain concepts, choose consistent terms, and record their definitions. Use when discussing codebase terminology or writing or editing GLOSSARY.md.
---

# Define domain language

Clarify domain concepts and relationships as you design. Challenge ambiguous terms, test their meanings with concrete scenarios, and record agreed definitions as they are resolved. Reading an existing glossary for vocabulary does not require this skill.

Use `model-domain` when the question extends beyond definitions to domain relationships, lifecycles, ownership, or business rules.

When the model drives code structure, such as stateful logic or a shape assumption repeated across files, choose the structure per `principle-model-the-domain`.

## File structure

Use a root `GLOSSARY.md` for a single context. If `GLOSSARY-MAP.md` exists, follow it to the relevant context's glossary.

Create a glossary only when the first term is resolved. Use the structure in `./GLOSSARY-FORMAT.md`.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with the existing language in `GLOSSARY.md`, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y. Which is it?"

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'account': do you mean the Customer or the User? Those are different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about the boundaries between concepts.

### Cross-reference with code

When the user states how something works, check whether the code agrees. If you find a contradiction, surface it: "Your code cancels entire Orders, but you just said partial cancellation is possible. Which is right?"

### Update GLOSSARY.md inline

When a term is resolved, update `GLOSSARY.md` right there. Don't batch these up: capture them as they happen. Use the format in `./GLOSSARY-FORMAT.md`.

`GLOSSARY.md` should be totally devoid of implementation details. Do not treat `GLOSSARY.md` as a spec, a scratch pad, or a repository for implementation decisions. It is a glossary and nothing else.
