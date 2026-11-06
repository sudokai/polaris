---
name: sweep-residue
description: "Sweep shipped code, text, and docs for leftover process residue from iteration and implementation-review-fix loops."
---

# Sweep Residue

Before you ship, read your work like a stranger who just joined the team. They weren't part of the conversation.

If something only makes sense because of that conversation, rewrite it.

## Sweep these 

- conversation, prompt, or iteration history leakage in code comments, pull request descriptions, or other maintainer-facing prose
- names, comments, or messages that only make sense if you saw an earlier version
- explanations of what changed instead of how the final thing works
- details singled out because they are new, or a new item in a list
- prior versions or rejected approaches still floating around in code or docs
- docs that don't match the code, fix if still valuable, delete if obsolete
- comments that can be turned into code, per `principle-encode-lessons-in-structure`
- commented-out code
- dead code, unused imports, orphan variables

## Report, don't sweep

- over-defensive code that grew from an overengineered implementation or from review-guided sequential fixes — compatibility shims, stacked if/else, temporary paths, etc. Simplifying it is the `deslop` skill's job.

## Don't sweep these by accident

- `TODO` / `FIXME` / `HACK` — usually intentional work-tracking
- debug logging — only remove if it's clearly leftover (logging added ad hoc to chase a specific bug)
- issue/PR references — often useful breadcrumbs

## The test

*"Does this stand on its own and read as if no prior conversation existed?"*

If no, rewrite it.
