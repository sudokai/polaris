---
name: record-architecture-decision
description: Record or update an architectural decision and its reasoning in an ADR. Use when a design choice needs lasting rationale, or when creating, editing, or superseding an ADR.
---

# Record architecture decision

Preserve reasoning that future contributors cannot recover from the code. Record a decision when forgetting its rationale could cause a harmful change or repeat a costly investigation. An inexpensive choice can qualify if contributors repeatedly undo it.

Skip routine implementation summaries, obvious choices, and progress logs. Keep implementation-session decisions in the `decision-log` skill's working log.

## Ground the decision

Read the relevant code and existing ADRs before writing. Establish the constraint, the choice, and why the alternatives were rejected. Distinguish agreed decisions from proposals. Do not invent rationale or present a proposal as accepted.

If the design is unresolved, use the `architect` skill to settle its structure. Use `sharpen-domain-language` when terms need clarification. An ADR records the choice; the model belongs in the code and design.

## Write the record

Use `./ADR-FORMAT.md`. Keep the record short, but include enough context to explain why the choice still matters. Link relevant code or evidence when it helps readers assess the rationale.

Use the repository's existing ADR location and conventions. Otherwise, use `docs/adr/` at the project root. In a repository with context-specific ADR directories, place a decision in its owning context and system-wide decisions at the root. Create directories only when writing the first record.

## Keep the decision discoverable and current

Link the ADR from the relevant architecture documentation or a nearby code comment when the reason would otherwise be missed. Avoid requiring every contributor to read the entire collection.

When a decision changes, mark the old record as superseded and link its replacement. Link back from the replacement and state why the earlier reasoning no longer applies. Correct factual errors in place without inventing a new decision.
