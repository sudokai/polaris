---
name: reflect
description: "Mine this session, or weeks of the user's agent history, for durable lessons, then route each one to a skill edit, a new skill, a playbook, a line in an instruction file, or a repo fix through `correct`. Use for \"reflect\", \"automate me\", \"turn how I work into playbooks or skills\", \"capture my workflows\", or wanting agents to follow how the user works."
disable-model-invocation: true
---

# Reflect

Mine evidence for durable lessons, route each lesson to the place where it changes what future agents do, and apply only what the user approves.

## When to run

Skip when the conversation is trivial, off-topic, or already covered by an existing skill that the session followed correctly. One-offs are not learnings. In history mode, skip when the period has too little activity to show repetition.

## 1. Pick the mode

- **`session`** (default): this conversation.
- **`history`**: the last two to four weeks of this project's transcripts. Use it when the user says "automate me", "across weeks", or "capture my workflows", or gives a date range.

## 2. Check what already exists

Read the playbook index in `../polaris/SKILL.md`, the local playbooks at both scopes (`../polaris/references/locations.md`), the skills the user has installed, the user's global instruction files (`../polaris/references/harnesses.md`), the project's agent instruction file, and `.agents/polaris/backlog.md`, if it exists. A lesson that one of these already captures is not new. A finding that matches a backlog entry is reported as that entry, not as a new finding. If the user asked to update earlier output, mine only the history since that output last changed (`git log -1 --format=%cI <path>`).

Also collect the user's other projects, so the synthesizer can promote a lesson that several projects hold. List the project folders under each harness's transcript location in `../polaris/references/harnesses.md`, and recover each project's path from the folder name or from the working directory recorded at the start of a session. Read only each project's agent instruction file, never its transcripts. Note each line that covers the same mistake class as a line in this project, with its project path.

## 3. Gather evidence

Find transcripts with `../polaris/references/harnesses.md`. Choose each subagent's model with `../polaris/references/models.md`. Give every subagent access to the MCP servers, because they look up the tickets, chat threads, and traces that transcripts reference. A read-only mode that removes MCP access defeats this.

### Session mode

Locate this session's transcript. If no path resolves, write a tight digest of the session and pass that instead.

For a routine session, start one fresh reviewer for `kind: reasoning`, `level: scoped` with `references/session-reviewer.md`, covering judgment, environment, and divergent angles in one read. Do not supply your preferred lessons before its first pass.

For a long session with several substantial decisions or failures, a disputed or consequential lesson, or an explicit request for broader independent coverage, start the three reviewers below at the same time. Use this path when a mistaken lesson could affect security, data loss, compatibility, or costly architectural decisions. State which review path you chose and why.

| Lens | Assignment | Prompt |
| --- | --- | --- |
| Judgment | `kind: reasoning`, `level: hard` | `references/judgment-reviewer.md` |
| Environment | `kind: execution`, `level: regular` | `references/environment-reviewer.md` |
| Divergent | `kind: reasoning`, `level: hard` | `references/divergent-reviewer.md` |

Pass the selected prompt or prompts, substituting the transcript path or digest where marked. Reviewers return concise, cited findings, not a retelling of the session, and do not start further agents.

### History mode

Filter in-scope transcripts by project and date first. Split a large corpus into up to three non-overlapping slices; use one miner for a small corpus. Start one miner per slice for `kind: execution`, `level: regular` extraction, with `references/history-miner.md` and the slice's transcript paths substituted where marked. Miners do not start further agents and return concise evidence of patterns, not session summaries.

Cross-check the miners' lists. Keep a pattern only if it appears at least twice, preferably in two or more slices.

Then ask the user to confirm patterns, because mining misses intent that has not come up yet. Ask one multiple-choice question for each pattern that needs confirmation, up to 10, starting with the weakest. A strong pattern needs no question. End with one open question to catch anything the patterns missed. Drop the patterns the user rejects, and add what the open question surfaces.

## 4. Synthesize

For a routine session, synthesize the independent review yourself using `references/synthesizer.md`, including its citation and routing checks. For the three-reviewer session path or history mode, retain one independent synthesizer for `kind: reasoning`, `level: hard` (or `kind: reasoning`, `level: very_hard` for exceptionally subtle conclusions) with MCP access for citation checks.

Fill in `<MODE>` with `session` or `history`, provide the findings at `<FINDINGS>`, and put the cross-project matches from step 2 at `<CROSS_PROJECT_MATCHES>` (or "none"). Pass concise findings or artifact paths rather than another copy of the transcript. Synthesis produces the same Accepted and Rejected lists and approval flow on every path.

If required independent coverage is unavailable, report it and ask before substituting self-review. Continue evidence gathering where useful; separate passes do not provide independent coverage.

## 5. Route

Each Accepted row has one destination and one scope: `project` for a lesson about this repository, or `user` for a lesson that holds across projects. Take the target paths from `../polaris/references/locations.md`. Never edit a bundled polaris file to record a lesson.

| Finding | Destination | How |
| --- | --- | --- |
| A gap in an polaris skill or playbook that the session used | One line in an instruction file | Add one line that names the skill or playbook and what to do differently, such as "When you run the polaris `how` skill in this repository, also read `docs/architecture.md`." Put it in the project's agent instruction file for a lesson about this repository, or in every harness's global instruction file for one that holds across projects, as **Writing a line for every harness** in `../polaris/references/harnesses.md` describes. |
| A gap in a standalone skill that the session used | Edit that skill where it lives | Make a trivial edit (a one-line bullet, a tightened sentence, a stale fact corrected) directly. Make a substantive edit (a new section, a new pattern table, more than ~10 lines) with the skill-creation skill that `../polaris/references/harnesses.md` names. If the skill is an installed copy of a plugin, treat the row as an upstream proposal instead. |
| An polaris skill that should have run but did not | Add a trigger | The router's Triggers list, not the skill's description, chooses when an polaris skill runs. Add one line that names the situation and the skill, such as "When you change a migration file, run the polaris `blast-radius` skill." Put it in the project's agent instruction file for a lesson about this repository, or in every harness's global instruction file for one that holds across projects, as **Writing a line for every harness** in `../polaris/references/harnesses.md` describes. If every polaris user would miss the same trigger, make it an upstream proposal for the router's Triggers list instead. |
| A standalone skill that should have triggered but did not | Tune its description | Edit the description where the skill lives. |
| A narrow procedure that keeps repeating | New skill | The skill-creation skill, in the project or user skill directory that `../polaris/references/harnesses.md` names. |
| A workflow that spans several skills | New local playbook | Write `.agents/polaris/playbooks/<name>.md` at the chosen scope, following `../polaris/playbooks/README.md` and the local playbook rules in `../polaris/references/locations.md`. Do not edit the bundled playbook index. |
| A defect that every polaris user would hit, in a skill, playbook, or principle | Upstream proposal | Draft the change against the plugin's source repository. Show it, and do not apply it. |
| A personal preference | One line in an instruction file | If it is about this project, the project's agent instruction file. If the evidence spans two or more projects, every harness's global instruction file, as **Writing a line for every harness** in `../polaris/references/harnesses.md` describes. If it applies to one harness only, that harness's global instruction file alone. Never put a preference into polaris. polaris holds shared method. |
| A repo-side mistake or environment gap | The `correct` skill (`../correct/SKILL.md`) | The synthesizer proposes the level, the user can raise it, and `correct` builds it. |
| A finding whose mistake class reaches beyond the skill that was used | One line in every harness's global instruction file | As **Writing a line for every harness** in `../polaris/references/harnesses.md` describes. If every polaris user would hit it, make it an upstream proposal for a polaris principle instead. |
| A finding that an existing entry already covers, or an instruction-file line to trim | Refine that entry | Reword, widen, merge, or remove the entry where it lives, instead of adding a new one. |
| The same lesson in two or more projects' instruction files | Promote it to user scope | Write one line in every harness's global instruction file, and remove this project's copy. List the copies in other projects for the user to remove. Do not edit other repositories. |
| Information the agent could not get, outside the repository | Suggest it | Say what to connect or grant, and why. Never apply it: it is the user's setup, and it often needs credentials. |

Write every draft for an agent reader, following the rules in `../polaris/playbooks/README.md`: keep only text that changes a decision, point at other skills by path instead of restating them, and use "the user" instead of the user's name.

## 6. Get approval

Present the synthesizer's full output, with evidence, in its order: the most costly problem first. Keep the `user (seen in one project)` marker visible, so the user can push such a row down to `project`. For each Accepted row, add the target path, whether the target is in a git repo or outside git, and the concrete draft. Then wait for explicit approval. The user picks which rows to apply, may redirect any destination or scope, and may raise the level of a repo-side fix. Skill changes affect every future agent, so do not apply anything without approval.

## 7. Apply

If a destination is a git repo, work on a branch there, and commit each playbook or skill separately so the user can review it. If a destination is not a git repo (for example, `~/.agents/polaris/`), show each change as a diff before writing it, and say in the reply that it is uncommitted.

1. Apply the approved agent-side rows, as the **How** column says. Do not apply `suggest` rows, or the removals that a `promote` row lists for other repositories.
2. Run the `correct` skill (`../correct/SKILL.md`) with the approved repo-side rows as its input. Rows that the user approves but defers go to `.agents/polaris/backlog.md`, as `correct` describes.
3. If the environment has a skill validator (for example, `python3 scripts/check_plugin.py` in the polaris repository), run it on every touched skill.

**Reply:** each finding with its evidence and the output it became, what the user approved and where it landed (the path written, and its repo or "outside git"), the upstream proposals left unapplied, the `suggest` rows and the copies in other repositories left for the user, the repo-side fixes that `correct` built, the entries deferred to `.agents/polaris/backlog.md`, and what was dropped and why.
