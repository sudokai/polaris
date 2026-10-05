---
name: reflect
description: "Mine this session, or weeks of the user's agent history, for durable lessons, then route each one to a skill edit, a new skill, a playbook, a line in an instruction file, or a repo fix through `correct`. Use for \"reflect\", \"automate me\", \"turn how I work into playbooks or skills\", \"capture my workflows\", or wanting agents to follow how the user works."
disable-model-invocation: true
---

# Reflect

This is the bundled `reflect` skill. Before you follow it, check whether `<project>/.agents/polaris/skills/reflect/SKILL.md` or `~/.agents/polaris/skills/reflect/SKILL.md` exists. If one does, follow the first that exists instead of this file, and resolve its references and scripts as `../polaris/references/locations.md` describes.

Mine evidence for durable lessons, route each lesson to the place where it changes what future agents do, and apply only what the user approves.

## When to run

Skip when the conversation is trivial, off-topic, or already covered by an existing skill that the session followed correctly. One-offs are not learnings. In history scope, skip when the period has too little activity to show repetition.

## 1. Pick the scope

- **`session`** (default): this conversation.
- **`history`**: the last two to four weeks of this project's transcripts. Use it when the user says "automate me", "across weeks", or "capture my workflows", or gives a date range.

## 2. Check what already exists

Read the playbook index in `../polaris/SKILL.md`, the local playbooks and skill overrides at both scopes (`../polaris/references/locations.md`), the skills the user has installed, the user's instruction files (`~/.agents/AGENTS.md` and the harness's own file in `../polaris/references/harnesses.md`), the project's agent instruction file, and `.agents/polaris/backlog.md`, if it exists. A lesson that one of these already captures is not new. A finding that matches a backlog entry is reported as that entry, not as a new finding. If the user asked to update earlier output, mine only the history since that output last changed (`git log -1 --format=%cI <path>`).

## 3. Gather evidence

Find transcripts with `../polaris/references/harnesses.md`. Choose each subagent's model with `../polaris/references/models.md`. Give every subagent access to the MCP servers, because they look up the tickets, chat threads, and traces that transcripts reference. A read-only mode that removes MCP access defeats this.

### Session scope

Locate this session's transcript. If no path resolves, write a tight digest of the session and pass that instead. Start the three reviewers at the same time:

| Lens | Role | Prompt |
| --- | --- | --- |
| Judgment | `deep` | `references/judgment-reviewer.md` |
| Environment | `standard` | `references/environment-reviewer.md` |
| Divergent | `deep` | `references/divergent-reviewer.md` |

Pass each prompt verbatim, substituting the transcript path or digest where marked.

### History scope

Split the period into three slices, so that each slice has enough material. Start one miner per slice at the same time, on the `standard` role, with `references/history-miner.md` verbatim and the slice's transcript paths substituted where marked.

Cross-check the miners' lists. Keep a pattern only if it appears at least twice, preferably in two or more slices.

Then ask the user to confirm patterns, because mining misses intent that has not come up yet. Ask one multiple-choice question for each pattern that needs confirmation, up to 10, starting with the weakest. A strong pattern needs no question. End with one open question to catch anything the patterns missed. Drop the patterns the user rejects, and add what the open question surfaces.

## 4. Synthesize

Start one synthesizer on the `ultra` role, with MCP access, because its quality check spot-verifies citations. Use `references/synthesizer.md` verbatim. Fill in `<SCOPE>` with `session` or `history`, and inline each reviewer's or miner's full output where marked. The synthesizer returns an Accepted and a Rejected list.

## 5. Route

Each Accepted row has one destination and one scope: `project` for a lesson about this repository, or `user` for a lesson that holds across projects. Take the target paths from `../polaris/references/locations.md`. Never edit a bundled polaris file to record a lesson.

| Finding | Destination | How |
| --- | --- | --- |
| A gap in an polaris skill that the session used | Override that skill | If the effective skill is already an override, edit it. Otherwise copy the bundled skill's directory to `.agents/polaris/skills/<name>/` at the chosen scope, add `overrides: polaris <plugin version> skills/<name>` to its frontmatter, delete its "This is the bundled" line, and edit the copy. Make a trivial edit (a one-line bullet, a tightened sentence, a stale fact corrected) directly. Make a substantive edit (a new section, a new pattern table, more than ~10 lines) with the skill-creation skill that `../polaris/references/harnesses.md` names. |
| A gap in a standalone skill that the session used | Edit that skill where it lives | Same edit rules as the previous row. If the skill is an installed copy of a plugin, treat the row as an upstream proposal instead. |
| An polaris skill that should have run but did not | Add a trigger | The router's Triggers list, not the skill's description, chooses when an polaris skill runs. Add one line that names the situation and the skill, such as "When you change a migration file, run the polaris `blast-radius` skill." Put it in the project's agent instruction file for a lesson about this repository, or in `~/.agents/AGENTS.md` for one that holds across projects. If every polaris user would miss the same trigger, make it an upstream proposal for the router's Triggers list instead. |
| A standalone skill that should have triggered but did not | Tune its description | Edit the description where the skill lives. |
| A narrow procedure that keeps repeating | New skill | The skill-creation skill, in the project or user skill directory that `../polaris/references/harnesses.md` names. |
| A workflow that spans several skills | New local playbook | Write `.agents/polaris/playbooks/<name>.md` at the chosen scope, following `../polaris/playbooks/README.md` and the local playbook rules in `../polaris/references/locations.md`. Do not edit the bundled playbook index. |
| A gap in an polaris playbook | Override that playbook | Copy it to `.agents/polaris/playbooks/<same name>.md` at the chosen scope, rewrite its paths as the local playbook rules require, and edit the copy. |
| A defect that every polaris user would hit, such as a gap in a principle | Upstream proposal | Draft the change against the plugin's source repository. Show it, and do not apply it. |
| A personal preference | One line in an instruction file | If it is about this project, the project's agent instruction file. If the evidence spans two or more projects, `~/.agents/AGENTS.md`. If it applies to one harness only, that harness's global instruction file in `../polaris/references/harnesses.md`. Never put a preference into polaris. polaris holds shared method. |
| A repo-side mistake or environment gap | The `correct` skill (`../correct/SKILL.md`) | The synthesizer proposes the level, the user can raise it, and `correct` builds it. |

Write every draft for an agent reader, following the rules in `../polaris/playbooks/README.md`: keep only text that changes a decision, point at other skills by path instead of restating them, and use "the user" instead of the user's name.

## 6. Get approval

Present the synthesizer's full output, with evidence. For each Accepted row, add the effective source the session followed (the bundled path or the override path), the target path, whether the target is in a git repo or outside git, and the concrete draft. Then wait for explicit approval. The user picks which rows to apply, may redirect any destination or scope, and may raise the level of a repo-side fix. Skill changes affect every future agent, so do not apply anything without approval.

## 7. Apply

If a destination is a git repo, work on a branch there, and commit each playbook or skill separately so the user can review it. If a destination is not a git repo (for example, `~/.agents/polaris/`), show each change as a diff before writing it, and say in the reply that it is uncommitted.

1. Apply the approved agent-side rows, as the **How** column says.
2. Run the `correct` skill (`../correct/SKILL.md`) with the approved repo-side rows as its input. Rows that the user approves but defers go to `.agents/polaris/backlog.md`, as `correct` describes.
3. If the environment has a skill validator (for example, `python3 scripts/check_plugin.py` in the polaris repository), run it on every touched skill.

**Reply:** each finding with its evidence and the output it became, what the user approved and where it landed (the path written, and its repo or "outside git"), the upstream proposals left unapplied, the repo-side fixes that `correct` built, the entries deferred to `.agents/polaris/backlog.md`, and what was dropped and why.
