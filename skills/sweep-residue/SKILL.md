---
name: sweep-residue
description: "Sweep shipped code, text, and docs for leftover process residue from iteration and implementation-review-fix loops."
---

# Sweep Residue

Before you ship, read your work like a stranger who just joined the team. They weren't part of the conversation.

If something only makes sense because of that conversation, rewrite it.

## Sweep these 

- details from the conversation, prompt, or iteration history that leaked into code comments, pull request descriptions, or other maintainer-facing prose
- names, comments, or messages that only make sense if you saw an earlier version
- explanations of what changed instead of how the final thing works
- details or list items called out only because they are new
- prior versions or rejected approaches still floating around in code or docs
- docs that don't match the code, fix if still valuable, delete if obsolete
- commented-out code
- dead code, unused imports, orphan variables

## Don't sweep these by accident

- `TODO` / `FIXME` / `HACK` — usually intentional work-tracking
- debug logging — only remove if it's clearly leftover (logging added ad hoc to chase a specific bug)
- issue/PR references — often useful breadcrumbs

## The test

*"Does this stand on its own and read as if no prior conversation existed?"*

If no, rewrite it.
