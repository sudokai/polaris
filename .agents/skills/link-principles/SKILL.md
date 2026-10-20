---
name: link-principles
description: "Link each polaris principle from a skill that an agent can start on its own, so agents find principles without /polaris. Use for /link-principles, or after adding a principle or a skill."
disable-model-invocation: true
---

# Link principles

An agent reads the router's principle index only after `/polaris`. In other sessions, it finds a principle only through a link in a skill it starts on its own: one listed in `AGENT_INVOCABLE_SKILLS` in `scripts/check_plugin.py`. This skill finds the gaps, proposes links, and adds the ones the user approves. Rerunning it after it finishes proposes nothing.

## 1. Map

Run `python3 .agents/skills/link-principles/scripts/principle_links.py .` from the repository root. It prints the skills that link to each principle, then two gap lists: principles that no such skill links to, and such skills that link to no principle. It leaves out the names in `unlinked-on-purpose.md`.

If both gap lists are empty, say so and stop.

## 2. Propose

For each unlinked principle, read its **Applies when:** line and the candidate skills in full. Pick the step in a skill where that condition arises during the skill's work. For each skill that links to no principle, check whether any principle's condition arises in one of its steps.

Propose one link per gap, as a table: principle, skill, the step, and the exact line. When no step fits, propose adding the name to `unlinked-on-purpose.md`, with the reason.

Write each link as one trigger line at that step, following the router's form: "**Situation** → per [Principle](../polaris/principles/<name>.md)", or a clause in an existing sentence of that step. Never add a reading list at the top of a skill. Keep the skill's voice; write the line per the `write-clearly` skill.

## 3. Confirm

Show the proposals and ask the user which to apply. Apply nothing before the user answers. For each rejected link, ask whether to add the name to `unlinked-on-purpose.md`. Otherwise the next run proposes it again.

## 4. Apply

1. Add each approved line, and each approved exclusion to `unlinked-on-purpose.md`.
2. Rerun the script. Both gap lists must be empty, apart from rejected links the user chose not to exclude.
3. Run `python3 scripts/check_plugin.py`.

Report the links added, the exclusions added, and the gaps left open.
