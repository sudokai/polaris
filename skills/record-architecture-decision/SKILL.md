---
name: record-architecture-decision
description: Record a consequential architectural choice with its context, rationale, consequences, and lifecycle. Use when creating, updating, or superseding an architectural decision record.
---

# Record architecture decision

The code shows what was decided, but not when or why. A dated record does, and together the records are a cheap index of the project's history. So write down what was true when the decision was made, not just the decision. Write one when losing a decision's rationale could cause a harmful reversal or repeated costly investigation. Skip routine implementation summaries, obvious choices, and progress logs. Keep working-session decisions in `decision-log`.

## Ground the choice

Read the relevant code, requirements, constraints, and existing decisions. Distinguish observed conditions from assumptions. Identify plausible alternatives and the criteria for choosing among them.

Separate proposed and agreed choices. Do not invent rationale or present a proposal as accepted. Resolve the design before recording the decision.

## Write the record

Use `docs/decisions/` for system-wide decisions. For an independently owned subsystem, use `docs/decisions/<subsystem>/`.

Name the file `YYYY-MM-DD-short-decision-title.md`, using the record's creation date. Use one file for one decision and keep its path stable. Create a directory only when it receives its first record.

Follow [the decision-record format](ADR-FORMAT.md). Explain the context, chosen approach, plausible alternatives, rationale, and consequences. State the conditions that would justify revisiting the choice. Include evidence when it helps a future contributor assess the decision.

A short record may answer these questions in prose without separate sections. Use the headings when they make a consequential decision easier to assess.

Generate indexes from filenames and metadata instead of maintaining a separate list of titles and statuses.

## Maintain the history

Edit a record to correct facts, improve clarity, repair links, or add evidence for the same choice. Revise a proposed record during deliberation. Update its lifecycle status as it is accepted, rejected, or superseded.

Create a new record when the chosen approach or its scope materially changes, new constraints invalidate the original rationale, or a rejected alternative is adopted. Give the old record `status: superseded` and `superseded_by`, and link the new record through `supersedes`. Explain in the new record why the earlier choice no longer fits.

Link the relevant record from current architecture documentation or a nearby code comment when a contributor could otherwise reverse the choice without seeing its rationale.
