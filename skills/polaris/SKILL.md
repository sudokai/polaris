---
name: polaris
description: "Route engineering work through polaris's principles, playbooks, and skills: map the code first, design for agents, and prove behavior on the real artifact. Use only for /polaris."
---

# polaris

Read this file in full before any work. It routes the task to a playbook or a skill, and it names the principles that govern every decision.

## For each new task

1. If the user says "new task", or the subject changes, match again. Do not continue the previous playbook.
2. Match the requested outcome to a playbook in **Playbooks**, or to a local playbook. Requests only for explanation, investigation, discussion, design, or a prototype stay with the relevant skill. If a playbook matches, run it as `playbooks/README.md` describes; its steps own the task's sequence and completion.
3. If no playbook fits, work directly from the principles and triggers below for a narrow task. Use [figure-it-out](../figure-it-out/SKILL.md) to design a task-specific playbook for work needing additional coordination. Size alone does not disqualify an existing playbook.
4. Before you apply a principle, read the linked `principle-<slug>` skill in full. The user can run that same skill by name.

## Triggers

The skills below sit next to this one. Most are hidden from automatic selection. Run a skill by reading its `SKILL.md` at the path given, relative to this file, and following it. Skills refer to each other the same way. `references/locations.md` defines local playbooks and where polaris writes its files.

- **About to change code you have not traced**, or asked how something works → [how](../how/SKILL.md).
- **Asked to explain or walk through a PR, a branch, a commit, or a diff** → [walkthrough](../walkthrough/SKILL.md).
- **Asked why code is shaped the way it is**, or looking for regression history → [why](../why/SKILL.md).
- **Writing or reviewing docs, RFCs, READMEs, plans, playbooks, PR descriptions, or commit messages** → [technical-writing](../technical-writing/SKILL.md).
- **Editing prose to remove AI writing patterns** → [deslop-language](../deslop-language/SKILL.md).
- **Any code** → name the data shape first, and choose its organizing structure per [Model the Domain](../principle-model-the-domain/SKILL.md). Name, type, and document it per [write-discoverable-code](../write-discoverable-code/SKILL.md).
- **Asked to discuss a plan, flesh out an idea, or settle a design before building** → [discuss](../discuss/SKILL.md).
- **Asked to save a standalone implementation plan from a settled design** → [finalize-plan](../finalize-plan/SKILL.md).
- **A domain term is vague, overloaded, or new**, or you are editing `GLOSSARY.md` or an ADR → [define-domain-language](../define-domain-language/SKILL.md).
- **Explaining a design, a flow, or a change that is easier to see than to read** → [show-me](../show-me/SKILL.md).
- **Substantial program, system, or product design, including foundational types, interfaces, ownership, or modules** → [architect](../architect/SKILL.md) before implementation, even when the approach seems clear.
- **Asked what a change could break**, or reviewing a change you do not trust yet → [blast-radius](../blast-radius/SKILL.md).
- **About to claim that a change works** → [prove-it](../prove-it/SKILL.md). "It compiles" and "the tests pass" are not proof of behavior.
- **A reported bug, a failure, or a regression** → [diagnose](../diagnose/SKILL.md), which writes its regression test with the `tdd` skill.
- **Building new behavior that tests can pin down** → [tdd](../tdd/SKILL.md).
- **Writing, changing, or keeping a test** → [no-change-detector-tests](../no-change-detector-tests/SKILL.md).
- **Starting an implementation that follows a plan or a spec** → [decision-log](../decision-log/SKILL.md), at the light level.
- **Finished a workpackage** → [deslop](../deslop/SKILL.md), then [sweep-residue](../sweep-residue/SKILL.md).
- **About to open or update a pull request** → [visual-pr](../visual-pr/SKILL.md).
- **The project has no scripted way to drive its app** → the Set up verification playbook.
- **The app changed and its verification skill may be out of date** → [maintain-verification-skill](../maintain-verification-skill/SKILL.md).
- **A race, a retry, a state machine, or another property that tests rarely reach** → [create-formal-verification-skill](../create-formal-verification-skill/SKILL.md).
- **Code that a formal check covers changed after the check's sync commit** → [maintain-formal-verification-skill](../maintain-formal-verification-skill/SKILL.md).
- **The user corrects a mistake that agents have made before** → [correct](../correct/SKILL.md). Make the mistake impossible instead of writing another rule.
- **Unattended work** → full-level [decision-log](../decision-log/SKILL.md), even with an existing playbook.
- **Before asking the user** → [Never Block on the Human](../principle-never-block-on-the-human/SKILL.md).
- **Asked to catch up on recent work** → [recall](../recall/SKILL.md). To resume one specific session → the Session pickup playbook.
- **User returns after stepping away or asks "where are we?"** → [ketchup](../ketchup/SKILL.md).
- **When a run the user stepped away from ends** → [ketchup](../ketchup/SKILL.md) for the final reply.
- **Asked to pause, or about to run out of context** → the Pause safely playbook.
- **A session taught something worth keeping**, the user says "reflect", or asked to turn the user's habits into playbooks or skills → [reflect](../reflect/SKILL.md).
- **Asked to change which models polaris uses** → [setup-polaris](../setup-polaris/SKILL.md).
- **A skill or playbook is broken mid-task** → finish the task without silently working around it, and propose the fix as a separate change.

## Principles

**Core**

- [Laziness Protocol](../principle-laziness-protocol/SKILL.md). Refactoring, sizing a diff, or tempted to add abstractions, layers, or signal threading.
- [Foundational Thinking](../principle-foundational-thinking/SKILL.md). Before writing logic: core types, data structures, scaffold-before-feature order, and what concurrent actors share.
- [Redesign from First Principles](../principle-redesign-from-first-principles/SKILL.md). Integrating a new requirement into an existing design.
- [Attack the Premise](../principle-attack-the-premise/SKILL.md). Two or more fixes that share one premise have failed the same check.
- [Subtract Before You Add](../principle-subtract-before-you-add/SKILL.md). Sequencing an addition, refactor, or rewrite.
- [Minimize Reader Load](../principle-minimize-reader-load/SKILL.md). Reviewing or shaping code that is hard to trace.
- [Outcome-Oriented Execution](../principle-outcome-oriented-execution/SKILL.md). Planned rewrites and migrations with explicit phase boundaries.
- [Experience First](../principle-experience-first/SKILL.md). Product, UX, or feature-scope tradeoffs.
- [Exhaust the Design Space](../principle-exhaust-the-design-space/SKILL.md). A novel interaction or architectural decision with no precedent.
- [Build the Lever](../principle-build-the-lever/SKILL.md). Any nontrivial work: build the script, codemod, or generator that does or proves it.

**Architecture**

- [Model the Domain](../principle-model-the-domain/SKILL.md). Stateful logic, or code that branches a lot or repeats a shape assumption across files.
- [Boundary Discipline](../principle-boundary-discipline/SKILL.md). Wiring validation, error handling, or framework adapters.
- [Type System Discipline](../principle-type-system-discipline/SKILL.md). Designing types or a signature in a typed language.
- [Make Operations Idempotent](../principle-make-operations-idempotent/SKILL.md). Commands, lifecycle steps, or loops that must survive crashes and retries.
- [Migrate Callers Then Delete Legacy APIs](../principle-migrate-callers-then-delete-legacy-apis/SKILL.md). Introducing a new internal API while old callers exist.
- [Separate Before Serializing Shared State](../principle-separate-before-serializing-shared-state/SKILL.md). Concurrent actors might write the same file, branch, key, or object.

**Verification**

- [Prove It Works](../principle-prove-it-works/SKILL.md). Before declaring a task done.
- [Fix Root Causes](../principle-fix-root-causes/SKILL.md). Debugging.
- [Sequence Work into Verifiable Units](../principle-sequence-verifiable-units/SKILL.md). Multi-step work, and how you order commits and pull requests.
- [Test Behavior, Not Implementation](../principle-test-behavior-not-implementation/SKILL.md). Writing, changing, or keeping a test.
- [Explain the Number](../principle-explain-the-number/SKILL.md). Before you trust, report, or act on a number you measured.

**Delegation**

- [Guard the Context Window](../principle-guard-the-context-window/SKILL.md). Large outputs, long files, repeated reads, or fan-out planning.
- [Never Block on the Human](../principle-never-block-on-the-human/SKILL.md). About to ask the user a question: who makes the call.

**Meta**

- [Encode Lessons in Structure](../principle-encode-lessons-in-structure/SKILL.md). You catch yourself writing the same instruction a second time.

## Playbooks

Run matched playbooks under `playbooks/README.md`. Also match the local playbooks in `.agents/polaris/playbooks/` in the project root and in `~`, as `references/locations.md` describes.

- **Feature development.** Add or change intended behavior. `playbooks/feature-development.md`.
- **Bug fix.** Fix a reported failure or performance regression. `playbooks/bug-fix.md`.
- **Refactor.** Change structure while preserving agreed behavior and external contracts. `playbooks/refactor.md`.
- **Set up verification.** The project has no scripted way to launch its app, drive a feature, and capture evidence. `playbooks/set-up-verification.md`.
- **Session pickup.** Resume or take over another agent's unfinished work from a transcript, a branch, or a resume note. `playbooks/session-pickup.md`.
- **Pause safely.** Stop in-flight work cleanly so that another session can resume it. `playbooks/pause-safely.md`.

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
