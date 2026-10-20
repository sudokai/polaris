# polaris

polaris is an agent plugin that routes coding work to playbooks and skills, and names the engineering principles behind each decision. It runs in several harnesses from one set of harness-neutral files.

## Language

### Plugin structure

**Router**:
The `polaris` skill. It matches each task to a playbook or a skill and indexes the principles.
_Avoid_: mode, router mode, main skill

**Skill**:
A directory with a `SKILL.md` that defines the method, decisions, and output for one capability. A skill may use other skills; its caller owns the surrounding task.

**Agent-invocable skill**:
A bundled skill that an agent can start on its own, without `/polaris`. It meets three conditions: it is useful without the router, it is cheap (no fan-out of subagents, no writes beyond the task), and the user wants it in sessions that did not start with `/polaris`. `AGENT_INVOCABLE_SKILLS` in `scripts/check_plugin.py` lists them.

**Hidden skill**:
A bundled skill that starts only from the router or when the user types its command.

**Bundled skill**:
A skill that ships in the plugin's `skills/` directory.
_Avoid_: built-in skill, plugin skill

**Standalone skill**:
A skill that lives outside the plugin, in a harness's own skill directory.

**Principle**:
A short rule for one kind of decision, shipped as a hidden skill named `principle-<slug>`. The user runs the command; an agent applies the rule from the router and does not start the skill on its own.
_Avoid_: principle file, task skill

**Playbook**:
A sequence of steps that owns a task's handoffs, completion checks, and delivery, naming the skills and principles each step uses. A playbook may be reusable or designed for one task.
_Avoid_: workflow, recipe

**Trigger**:
One line in the router that names a situation and the skill to run in it.

**Glossary**:
The `GLOSSARY.md` file at a project's root that defines the project's terms. The `define-domain-language` skill writes it.
_Avoid_: context file

**ADR**:
An architecture decision record: a short file in `docs/adr/` that records one decision that is hard to reverse, and why it was made.
_Avoid_: design doc

### Harnesses and models

**Harness**:
An agent client that loads the plugin, such as Claude Code, Codex, or Grok Build. Each has an identifier: `claude-code`, `codex`, `cursor`, `pi`, `hermes`, `dsh`, or `grok-build`.
_Avoid_: client, host, tool

**Harness fact file**:
A file holding harness-specific facts, such as [model budgets](skills/polaris/references/models.md), [harness behavior](skills/polaris/references/harnesses.md), [rendering guidance](skills/polaris/references/rendering-pictures.md), [global instruction rules](skills/polaris/references/writing-global-instructions.md), or a selected profile under `skills/polaris/references/model-profiles/`. Setup also contains harness-specific configuration steps. Other skill text is harness-neutral.

**Work kind**:
The main challenge in an assignment: reasoning finds or evaluates an approach or explanation; execution carries out a familiar or settled approach.
_Avoid_: role, work category

**Work level**:
The difficulty within a work kind: scoped, hard, or very hard for reasoning; regular or complex for execution. Levels do not form a shared scale across kinds.

**Unclassified allocation**:
The temporary model–effort fallback for an assignment whose kind and level are not yet clear. Reassess after initial exploration.

**Budget**:
A small, medium, large, or unlimited allocation policy. Medium is the default. A budget is not a monetary cap.

**Model profile**:
A family's table of model–effort pairs by work kind, level, and budget, independent of the harness.

**Model-pair agent**:
An agent definition that fixes a model and effort for a harness that cannot apply the pair directly.

**Fallback**:
An explicitly authorized replacement pair or a reported harness limitation when the selected pair cannot run. Required independent judgment cannot silently become self-review.

### Local files

**Project scope**:
Applies to one repository. Its files live in `<project>/.agents/polaris/`.

**User scope**:
Applies to every project for one user. Its files live in `~/.agents/polaris/`.

**Local playbook**:
A playbook in a project or user `playbooks/` directory, outside the bundled index.
_Avoid_: learned playbook, custom playbook

**Upstream proposal**:
A drafted change to the plugin's source repository for a defect every polaris user would hit. It is shown, never applied.

**Model configuration file**:
A `models.yaml` at project or user scope, with profile, budget, fixed kind/level overrides, and optional ordered fallbacks for each configured harness.

**Resume note**:
A personal, uncommitted note that records where a paused task stopped, so another session can resume it.
_Avoid_: handoff note, checkpoint

**Backlog**:
The committed list of repo-side fixes that the user approved but chose to defer: `.agents/polaris/backlog.md`.

### Learning from sessions

**Finding**:
One lesson that `reflect`'s reviewers or miners propose, with its evidence.

**Destination**:
Where an accepted finding lands: a trigger line, a new skill, a local playbook, an instruction-file line, an upstream proposal, or a repo-side fix.

**Session mode**:
The `reflect` mode that reviews the current conversation for the lesson one incident teaches.
_Avoid_: session scope

**History mode**:
The `reflect` mode that mines weeks of transcripts for patterns that repeat.
_Avoid_: history scope

**Repo-side fix**:
A change to the project itself (architecture, types, lints, tests, or docs) that makes a repeated agent mistake impossible. `correct` builds it.

**Mistake class**:
The kind of mistake one incident is a case of. `reflect` words a lesson for the class, and `correct` fixes the class, not the single incident.
_Avoid_: mistake type, error category

**Rule table**:
The table in the repo's agent instruction file that pairs each rule with what enforces it.

**User's instruction file**:
The user's personal agent instructions: each harness's global instruction file, such as `~/.claude/AGENTS.md`. Distinct from the repo's agent instruction file.
_Avoid_: global rules, steering file

### Verification

**Verification skill**:
A project-local skill, generated by `create-verification-skill`, that launches the real app, drives a feature, and keeps the evidence.

**Feature map**:
The files inside a verification skill, one per user-facing feature, that say how to reach the feature, drive it, and prove it works.

**Verdict**:
The single result of `prove-it`: `VERIFIED`, `NOT VERIFIED`, or `INCONCLUSIVE`.

**Evidence ladder**:
The ordered steps of proof `prove-it` reports: claimed, line cited, failure walked through, script run, reproduced in the running app.

**Formal verification skill**:
A project-local skill, generated by `create-formal-verification-skill`, that runs a model checker, a prover, or another verifier to show that one property holds in every case in a stated scope.

**Sync commit**:
The commit at which a formal verification skill was last confirmed to describe the code it covers.

**Walkthrough**:
A staged explanation of a changeset, from its purpose to its code, that the `walkthrough` skill gives. An explanation of existing code is the `how` skill's job.
_Avoid_: code walkthrough, tour

**Workpackage**:
One finished unit of implementation, such as a feature or a fix, that `deslop` and then `sweep-residue` clean up.
_Avoid_: work package, chunk

**Decision log**:
The TSV file that the `decision-log` skill keeps during implementation, with one row per decision or deviation from the plan.
_Avoid_: audit trail, implementation notes

### People

**User**:
The person working with the agent. polaris text says "the user", never a name.
_Avoid_: operator, owner
