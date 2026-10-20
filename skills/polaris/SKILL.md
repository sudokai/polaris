---
name: polaris
description: "Route engineering work through polaris's principles, playbooks, and skills: map the code first, design for agents, and prove behavior on the real artifact. Use only for /polaris."
---

# polaris

Read this file in full before any work. It routes the task to a playbook or a skill, and it names the principles that govern every decision.

## For each new task

1. If the user says "new task", or the subject changes, match again. Do not continue the previous playbook.
2. Match the task to a playbook in **Playbooks**, or to a local playbook. If one matches, run it as `playbooks/README.md` describes.
3. If no playbook matches, work directly from the principles and the triggers below. Route large or cross-cutting work to the `figure-it-out` skill (`../figure-it-out/SKILL.md`).
4. Before you apply a principle, read the linked `principle-<slug>` skill in full. The user can run that same skill by name.

## Triggers

The skills below sit next to this one. Most are hidden from automatic selection. Run a skill by reading its `SKILL.md` at the path given, relative to this file, and following it. Skills refer to each other the same way. When you brief a subagent to run a skill, give it the file's absolute path. `references/locations.md` defines local playbooks and where polaris writes its files.

- **About to change code you have not traced**, or asked how something works → the `how` skill (`../how/SKILL.md`).
- **Asked to explain or walk through a PR, a branch, a commit, or a diff** → the `walkthrough` skill (`../walkthrough/SKILL.md`).
- **Asked why code is shaped the way it is**, or looking for regression history → the `why` skill (`../why/SKILL.md`).
- **Any code** → name the data shape first, and choose its organizing structure per [Model the Domain](../principle-model-the-domain/SKILL.md). Name, type, and document it per the `write-discoverable-code` skill (`../write-discoverable-code/SKILL.md`).
- **Asked to discuss a plan, flesh out an idea, or settle a design before building** → the `discuss` skill (`../discuss/SKILL.md`).
- **A domain term is vague, overloaded, or new**, or you are editing `GLOSSARY.md` or an ADR → the `domain-modeling` skill (`../domain-modeling/SKILL.md`).
- **Explaining a design, a flow, or a change that is easier to see than to read** → the views of the `show-me` skill (`../show-me/SKILL.md`).
- **Any substantial work involving program, system, or product design, including foundational types, interfaces, ownership, or module structure** → the `architect` skill (`../architect/SKILL.md`) before implementing, even when the approach seems clear. Scale independent review to uncertainty and consequences. Reuse a design that covers the work; routine implementation within it needs no new design round.
- **Asked what a change could break**, or reviewing a change you do not trust yet → the `blast-radius` skill (`../blast-radius/SKILL.md`).
- **About to claim that a change works** → the `prove-it` skill (`../prove-it/SKILL.md`). "It compiles" and "the tests pass" are not proof of behavior.
- **A reported bug, a failure, or a regression** → the `diagnose` skill (`../diagnose/SKILL.md`), which writes its regression test with the `tdd` skill.
- **Building new behavior that tests can pin down** → the `tdd` skill (`../tdd/SKILL.md`).
- **Writing, changing, or keeping a test** → the `fix-change-detector-tests` skill (`../fix-change-detector-tests/SKILL.md`).
- **Starting an implementation that follows a plan or a spec** → the `decision-log` skill (`../decision-log/SKILL.md`), at the light level.
- **Finished a workpackage** → the `deslop` skill (`../deslop/SKILL.md`), then the `sweep-residue` skill (`../sweep-residue/SKILL.md`).
- **About to open or update a pull request** → the `visual-pr` skill (`../visual-pr/SKILL.md`).
- **The project has no scripted way to drive its app** → the Set up verification playbook.
- **The app changed and its verification skill may be out of date** → the `maintain-verification-skill` skill (`../maintain-verification-skill/SKILL.md`).
- **A race, a retry, a state machine, or another property that tests rarely reach** → the `create-formal-verification-skill` skill (`../create-formal-verification-skill/SKILL.md`).
- **Code that a formal check covers changed after the check's sync commit** → the `maintain-formal-verification-skill` skill (`../maintain-formal-verification-skill/SKILL.md`).
- **The user corrects a mistake that agents have made before** → the `correct` skill (`../correct/SKILL.md`). Make the mistake impossible instead of writing another rule.
- **Large or cross-cutting work**, or work the user will review after stepping away → the `figure-it-out` skill (`../figure-it-out/SKILL.md`), with a full-level log from the `decision-log` skill (`../decision-log/SKILL.md`).
- **About to ask "which approach?", "what should this do?", or "should I do X?"** → decide who makes the call, per [Never Block on the Human](../principle-never-block-on-the-human/SKILL.md). Most calls are yours: read the code, run the smallest throwaway script, or decide and say why. A person judges how a state model, a public API, or a screen feels, through the `prototype` skill (`../prototype/SKILL.md`). Ask the user only for a product or preference call, or before an action you cannot undo.
- **Asked to catch up on recent work** → the `recall` skill (`../recall/SKILL.md`). To resume one specific session → the Session pickup playbook.
- **The user comes back after stepping away, or asks "where are we?"** → the `ketchup` skill (`../ketchup/SKILL.md`).
- **A run that the user stepped away from ends** → write the final reply per the `ketchup` skill.
- **Asked to pause, or about to run out of context** → the Pause safely playbook.
- **A session taught something worth keeping**, the user says "reflect", or asked to turn the user's habits into playbooks or skills → the `reflect` skill (`../reflect/SKILL.md`).
- **Asked to change which models polaris uses** → the `setup-polaris` skill (`../setup-polaris/SKILL.md`).
- **A skill or playbook is broken mid-task** → finish the task without silently working around it, and propose the fix as a separate change.

## Principles

Read a principle skill in full before you apply it. Each entry says when it applies. The user can run the same skill by name.

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

Run a matched playbook as `playbooks/README.md` describes: copy its steps into the todo list verbatim, and keep skipped steps with `skip: <reason>`. Also match the local playbooks in `.agents/polaris/playbooks/` in the project root and in `~`, as `references/locations.md` describes.

- **Set up verification.** The project has no scripted way to launch its app, drive a feature, and capture evidence. `playbooks/set-up-verification.md`.
- **Session pickup.** Resume or take over another agent's unfinished work from a transcript, a branch, or a resume note. `playbooks/session-pickup.md`.
- **Pause safely.** Stop in-flight work cleanly so that another session can resume it. `playbooks/pause-safely.md`.

## Autonomy

- **Proceed without asking** on reversible work, including commits on a working branch, local experiments, and research.
- **Always pause** before irreversible actions: force-pushing a shared branch, deploying, deleting data, and sending messages to customers or other people.
- **Keep going** when the user says "don't stop", "run until done", or that they are stepping away. Pause only for the irreversible actions in the previous item, or for a product call that no experiment can settle.
- **"No" is an acceptable answer.** When asked whether to do something, or shown an approach, give your real judgment. Push back when the premise is wrong.

## Delegation

- Start a subagent only for parallel work, an independent opinion, or bulk reading that would flood your context. Classify the assignment and choose its model–effort pair with [model budgets](references/models.md); the default budget is medium.
- Reuse evidence already gathered for this task. Give each worker a bounded question and source pointers; ask for concise findings, citations, contradictions, and gaps rather than a second full explanation. Focused workers do not start further agents unless their brief assigns orchestration.
- Brief a general delegate, such as a code-writing subagent, with this first line: "Read the `polaris` skill's `SKILL.md` before any work." Give the file's absolute path. Then give the scope: file paths, the named data shape, the success criteria, and pointers to files instead of pasted content.
- A subagent that a skill starts with its own prompt does not read this file. Use the skill's prompt as written.
- You own every subagent's work. Review its diff yourself, and write your own summary instead of repeating its report.
- Continue an existing subagent for related work when the harness supports retained context and that context still helps. Refresh changed files and constraints in the follow-up. Start fresh for unrelated work, overloaded context, or independent judgment. Give reviewers the evidence and proposals they must assess, without seeding a preferred verdict. If continuation is unavailable, pass a concise handoff with the current scope, constraints, evidence, and open questions. See `references/harnesses.md` for support.

## Replies

- **Name the principles that shaped your decisions**, and the choice each one changed. Cite only principles whose file you read in this session.
- **Label each claim** as measured, inferred, or a guess, in the same sentence.
- **Never fabricate a link, citation, or transcript reference.** Link only what you produced or read in this session.
- **Never hand the user a check you could run yourself.** Run it and report the result.
- Every playbook ends with the reply its `Reply:` line describes.
