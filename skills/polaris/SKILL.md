---
name: polaris
description: "Route engineering work through polaris's principles, playbooks, and skills: map the code first, design for agents, and prove behavior on the real artifact. Use only for /polaris."
---

# polaris

Read this file in full before any work. It routes the task to a playbook or a skill, and it names the principles that govern every decision.

## For each new task

1. If the user says "new task", or the subject changes, match again. Do not continue the previous playbook.
2. Match the requested outcome to a playbook in **Playbooks**, or to a local playbook. Requests only for explanation, investigation, discussion, design, or a prototype stay with the relevant skill. If a playbook matches, run it as [Playbooks](playbooks/README.md) describes; its steps own the task's sequence and completion.
3. If no playbook fits, work directly from the principles and triggers below for a narrow task. Use `figure-it-out` to design a task-specific playbook for work needing additional coordination. Size alone does not disqualify an existing playbook.
4. Before you apply a principle, read the named `principle-<slug>` skill in full. The user can run that same skill by name.

## Triggers

Bundled skills are sibling directories under `skills/`. Resolve a skill name as `skills/<name>/SKILL.md` from the plugin root. Principle names include the `principle-` prefix. These conventions apply to skill names throughout the bundled skills. Use the shortest clear reference with an explicit, validated path. Add a Markdown link label when it helps the reader decide whether to open the file. Otherwise use a backticked path. Keep configuration paths, output paths, and filename examples in backticks. Resolve supporting paths relative to the document containing the reference, not the working directory or the skill root. Paths explicitly described as project paths resolve from the project root. Most skills are hidden from automatic selection. Run a named skill by reading its file in full and following it. When delegating, pass the plugin root and the absolute path of each skill or prompt file. Copied prompt text keeps its source file as the base for relative references. [The locations reference](references/locations.md) defines local playbooks and where polaris writes its files.

- **About to change code you have not traced**, or asked how something works → `how`.
- **Asked to explain or walk through a PR, a branch, a commit, or a diff** → `walkthrough`.
- **Asked why code is shaped the way it is**, or looking for regression history → `why`.
- **Writing or reviewing docs, RFCs, READMEs, plans, playbooks, PR descriptions, or commit messages** → `technical-writing`.
- **Editing prose to remove AI writing patterns** → `deslop-language`.
- **Any code** → name the data shape first, and choose its organizing structure per `principle-model-the-domain`. Name, type, and document it per `write-discoverable-code`.
- **Asked to discuss a plan, flesh out an idea, or settle a design before building** → `discuss`.
- **Asked to save a standalone implementation plan from a settled design** → `finalize-plan`.
- **A domain term is vague, overloaded, or new**, or you are editing `GLOSSARY.md` or an ADR → `define-domain-language`.
- **Explaining a design, a flow, or a change that is easier to see than to read** → `show-me`.
- **Substantial program, system, or product design, including foundational types, interfaces, ownership, or modules** → `architect` before implementation, even when the approach seems clear.
- **Asked what a change could break**, or reviewing a change you do not trust yet → `blast-radius`.
- **About to claim that a change works** → `prove-it`. "It compiles" and "the tests pass" are not proof of behavior.
- **A reported bug, a failure, or a regression** → `diagnose`, which writes its regression test with the `tdd` skill.
- **Building new behavior that tests can pin down** → `tdd`.
- **Writing, changing, or keeping a test** → `no-change-detector-tests`.
- **Starting an implementation that follows a plan or a spec** → `decision-log`, at the light level.
- **Finished a workpackage** → `deslop`, then `sweep-residue`.
- **About to open or update a pull request** → `visual-pr`.
- **The project has no scripted way to drive its app** → the Set up verification playbook.
- **The app changed and its verification skill may be out of date** → `maintain-verification-skill`.
- **A race, a retry, a state machine, or another property that tests rarely reach** → `create-formal-verification-skill`.
- **Code that a formal check covers changed after the check's sync commit** → `maintain-formal-verification-skill`.
- **The user corrects a mistake that agents have made before** → `correct`. Make the mistake impossible instead of writing another rule.
- **Unattended work** → full-level `decision-log`, even with an existing playbook.
- **Before asking the user** → `principle-never-block-on-the-human`.
- **Asked to catch up on recent work** → `recall`. To resume one specific session → the Session pickup playbook.
- **User returns after stepping away or asks "where are we?"** → `ketchup`.
- **When a run the user stepped away from ends** → `ketchup` for the final reply.
- **Asked to pause, or about to run out of context** → the Pause safely playbook.
- **A session taught something worth keeping**, the user says "reflect", or asked to turn the user's habits into playbooks or skills → `reflect`.
- **Asked to change which models polaris uses** → `setup-polaris`.
- **A skill or playbook is broken mid-task** → finish the task without silently working around it, and propose the fix as a separate change.

## Principles

**Core**

- `principle-laziness-protocol`. Refactoring, sizing a diff, or tempted to add abstractions, layers, or signal threading.
- `principle-foundational-thinking`. Before writing logic: core types, data structures, scaffold-before-feature order, and what concurrent actors share.
- `principle-redesign-from-first-principles`. Integrating a new requirement into an existing design.
- `principle-attack-the-premise`. Two or more fixes that share one premise have failed the same check.
- `principle-subtract-before-you-add`. Sequencing an addition, refactor, or rewrite.
- `principle-minimize-reader-load`. Reviewing or shaping code that is hard to trace.
- `principle-outcome-oriented-execution`. Planned rewrites and migrations with explicit phase boundaries.
- `principle-experience-first`. Product, UX, or feature-scope tradeoffs.
- `principle-exhaust-the-design-space`. A novel interaction or architectural decision with no precedent.
- `principle-build-the-lever`. Any nontrivial work: build the script, codemod, or generator that does or proves it.

**Architecture**

- `principle-model-the-domain`. Stateful logic, or code that branches a lot or repeats a shape assumption across files.
- `principle-boundary-discipline`. Wiring validation, error handling, or framework adapters.
- `principle-type-system-discipline`. Designing types or a signature in a typed language.
- `principle-make-operations-idempotent`. Commands, lifecycle steps, or loops that must survive crashes and retries.
- `principle-migrate-callers-then-delete-legacy-apis`. Introducing a new internal API while old callers exist.
- `principle-separate-before-serializing-shared-state`. Concurrent actors might write the same file, branch, key, or object.

**Verification**

- `principle-prove-it-works`. Before declaring a task done.
- `principle-fix-root-causes`. Debugging.
- `principle-sequence-verifiable-units`. Multi-step work, and how you order commits and pull requests.
- `principle-test-behavior-not-implementation`. Writing, changing, or keeping a test.
- `principle-explain-the-number`. Before you trust, report, or act on a number you measured.

**Delegation**

- `principle-guard-the-context-window`. Large outputs, long files, repeated reads, or fan-out planning.
- `principle-never-block-on-the-human`. About to ask the user a question: who makes the call.

**Meta**

- `principle-encode-lessons-in-structure`. You catch yourself writing the same instruction a second time.

## Playbooks

Run matched playbooks under [Playbooks](playbooks/README.md). Resolve each bundled playbook title as `playbooks/<title>.md` relative to this skill, with the title in lowercase and spaces replaced by hyphens. Explicit paths override this convention. Also match the local playbooks in `.agents/polaris/playbooks/` in the project root and in `~`, as [the locations reference](references/locations.md) describes.

- **Feature development.** Add or change intended behavior.
- **Bug fix.** Fix a reported failure or performance regression.
- **Refactor.** Change structure while preserving agreed behavior and external contracts.
- **Set up verification.** The project has no scripted way to launch its app, drive a feature, and capture evidence.
- **Session pickup.** Resume or take over another agent's unfinished work from a transcript, a branch, or a resume note.
- **Pause safely.** Stop in-flight work cleanly so that another session can resume it.

Explicit pause, pickup, and verification-setup requests use their specific playbooks. A missing harness discovered during feature or refactor work is a nested verification step, not a replacement for the original task. Planning-only requests do not authorize implementation.

## Autonomy

- **Proceed without asking** on reversible work, including commits on a working branch, local experiments, and research.
- **Always pause** before irreversible actions: force-pushing a shared branch, deploying, deleting data, and sending messages to customers or other people.
- **Keep going** when the user says "don't stop", "run until done", or that they are stepping away. Pause only for the irreversible actions in the previous item, or for a product call that no experiment can settle.
- **"No" is an acceptable answer.** When asked whether to do something, or shown an approach, give your real judgment. Push back when the premise is wrong.

## Delegation

Before delegating, read [delegation guidance](references/delegation.md) and select the model–effort pair under [model budgets](references/models.md).

## Replies

- **Name the principles that shaped your decisions**, and the choice each one changed. Cite only principles whose file you read in this session.
- **Label each claim** as measured, inferred, or a guess, in the same sentence.
- **Never fabricate a link, citation, or transcript reference.** Link only what you produced or read in this session.
- **Never hand the user a check you could run yourself.** Run it and report the result.
