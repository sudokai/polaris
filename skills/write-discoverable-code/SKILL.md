---
name: write-discoverable-code
description: "Make code easy to find through plain-text search. Apply when naming or renaming symbols, files, event names, error messages, or doc comments."
license: MIT
---

# Write discoverable code

Write code that an agent or a person unfamiliar with the codebase can find by searching for plain text. Follow project and framework conventions, and preserve public APIs.

## Use searchable names

- Reuse the project's domain vocabulary. Use one spelling for a concept across symbols, files, and error messages.
- Name the thing a verb acts on. Write `validateSmtpConfig`, not `validate`, and `formatDurationMs`, not `format`.
- If a name may be ambiguous, search for it. Add a domain term if the results show unrelated code.
- Name files after the concept they implement. Avoid generic names such as `utils` or `helpers` when a more specific name is clearer. Keep conventional entry points and framework-required names.
- Rename a symbol when its name becomes misleading.

## Keep search terms in the source

- Use full, fixed strings for event names, feature flags, and error codes when possible. If you build them dynamically, list the possible values in one place.
- Give errors that may appear in logs a stable, distinctive literal prefix. Dynamic details can follow the prefix.
- Document constraints that the code does not show, such as units, time zones, ownership, or ordering. Do not add a comment to every export.
- In doc comments, use the words someone would search for. For example, a comment on `RateLimiter` can include "rate limit".

## Check the result

Search for a few new names and error prefixes using words that someone unfamiliar with the code would choose. If the search does not find the right code, add those words to the name, error prefix, or doc comment.
