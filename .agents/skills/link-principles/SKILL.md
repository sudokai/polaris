---
name: link-principles
description: "Review principle references for useful guidance and discoverability without excessive linking. Add, correct, or remove links where they affect a skill's decisions. Use for /link-principles, or after adding a principle or a skill."
disable-model-invocation: true
---

# Link principles

An agent reads the router's principle index only after `/polaris`. Links from skills it starts on its own can make principles discoverable in other sessions. The user can also invoke a principle by name.

Link when a principle supplies decision guidance a step needs. Omit a link when it merely names what the step already explains. Keep each rule in one maintained place, and keep the skill's task, sequence, and required outputs clear without opening every reference.

## 1. Map

Run `python3 .agents/skills/link-principles/scripts/principle_links.py .` from the repository root. It maps direct links from skills in `AGENT_INVOCABLE_SKILLS` in `scripts/check_plugin.py` and reports unlinked principles and skills. It leaves out names in `unlinked-on-purpose.md`.

Treat these lists as review candidates, not failures or quotas. The map does not inspect hidden skills, supporting references, or links reached through other skills. Empty lists do not prove that existing links are useful; a skill with no principle link may need none.

Review new or changed skills and principles. When asked for a broader audit, include existing links in that scope, even when the lists are empty.

## 2. Review and propose

Read each candidate skill in full, its relevant supporting references, and the full principle being considered. Check both the principle's applicability and the guidance it adds:

- Name the concrete decision and what the principle helps the agent decide beyond the skill's existing procedure. Shared subject matter alone is insufficient.
- Check that the cited principle governs that decision. Replace a mismatched citation rather than adding another beside it.
- Omit or remove links that merely label a complete local procedure. Do not repeat a principle's full rules beside its link.
- Account for what each reader receives. A separate agent prompt may need guidance already present in the coordinator's skill; that repetition can be necessary.
- Weigh the reading cost. Prefer one relevant reference at the decision step over several overlapping references or a chain of files to open.

Propose only useful additions, replacements, and removals. Give a table with the action, principle, skill, step, exact proposed wording, and the decision it improves. If nothing earns a change, say so and stop. Uncovered principles and skills without links may remain, with an explanation. Propose an exclusion in `unlinked-on-purpose.md` only when recording that reason would prevent repeated unnecessary proposals.

Write links as a short clause in the relevant step or a conditional trigger: "**Situation** → per [Principle](../principle-<name>/SKILL.md)". Never add a reading list at the top of a skill. Keep the skill's voice; use the `write-clearly` skill.

## 3. Confirm

Show proposals and ask which to apply, unless the user has already authorized those changes. Apply no unapproved changes. Offer an exclusion for a rejected link only when useful; rejection alone does not make an exclusion necessary.

## 4. Apply

1. Apply the approved link changes and exclusions. Remove approved exclusions whose reasons no longer hold.
2. Rerun the script. Explain remaining discovery gaps; do not add links or exclusions just to make the lists empty.
3. Run `python3 scripts/check_plugin.py`.

Review the diff for duplicate guidance and unnecessary reading. Report links added, corrected, or removed, exclusions changed, remaining discovery gaps, and validation results.
