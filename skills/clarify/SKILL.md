---
name: clarify
description: "Find and fix the three faults that make AI prose hard to read: hidden characters and actions, vague wording, and empty statements or misplaced emphasis. Use when asked to deslop, clarify, or make a message, PR description, or doc easier to read."
---

# Clarify

Rewrite the text the user points to. If they point to nothing, rewrite your last message.

Unclear writing, not AI vocabulary, is what frustrates readers ([Why is AI Slop so Frustrating to Read?](https://zonderlabs.com/slop), after Williams and Bizup, _Style: The Basics of Clarity and Grace_). AI tells such as "delve" or em dashes don't make writing unclear, so removing them doesn't make it clear. Check each sentence for the three faults below, and rewrite only the sentences that have one.

## 1. Hidden characters and actions

Every sentence tells a small story: someone or something (the character) does something (the action). Find both, then make the character the subject and the action the verb.

- Unclear: "A request for grapes was made upon the duck's arrival at the lemonade stand."
- Clear: "The duck walked up to the lemonade stand and asked for grapes."

Look for actions turned into nouns ("arrival", "request", "validation", "reproduction") and for subjects that are abstractions while the real actor sits elsewhere or is missing. Put something other than the character in the subject only when it serves a purpose, such as keeping the paragraph's topic in the subject position.

## 2. Vague wording

The reader must know exactly what each word refers to.

- **Strange word combinations.** Ask what a person who knows the subject would call the thing. "Beverage retailer" is a lemonade stand. "The database readiness check sits at the user-session entry boundary" describes code as a place. Say when it runs instead: "When a user session starts, the app checks that the database is ready." Use the project's own names for its code and concepts.
- **Stacked nouns.** Break a chain of three or more nouns into phrases that show how they relate: "grape availability request" becomes "asked whether they had grapes".
- **Ambiguous references.** Replace "this", "it", "that", or "they" with the noun when more than one thing could fit.

## 3. Empty statements and misplaced emphasis

A reader skimming the message should get its point in one pass.

- Unclear: "Nothing else depends on anything but the result, so I'll report as soon as the poll returns."
- Clear: "I'll report the result when the poll finishes. Nothing else is pending."

Find the one thing the reader needs and put it first in the message or paragraph. Cut statements that tell the reader nothing new or nothing they can act on. Put supporting reasons after the point, or drop them.

## Rules

- Keep every fact, number, path, name, and caveat the reader needs. Don't add facts.
- If you can't tell who acts or what a phrase refers to, ask rather than guess.
- Leave clear sentences as they are, even if an AI wrote them.
- After rewriting, reread the result as the intended reader and fix any sentence that still has a fault.

## Output

Return the rewritten text. If the user asked for a review instead of a rewrite, list each unclear sentence with its fault and a suggested rewrite.
