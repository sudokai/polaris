---
name: polaris
description: "Route engineering work to the right playbook, skill, or principle. Use only for /polaris."
---

# polaris

Read this file in full before any work.

## Start each task

1. For each new task, say in your own words the user's goal, the problem it solves, and, if the task ships a change, the smallest change you expect to meet the goal. Do not wait for confirmation. If the evidence rules out the change the user asked for, show the evidence and stop.
2. Match the request to a playbook in [Playbooks](#playbooks). A request only to explain, investigate, discuss, design, or prototype goes to the skill that fits and doesn't authorize implementation.
3. Before substantial work, set up a way to check the result on the real artifact, write a playbook for the task following the format in [the playbook rules](playbooks/README.md), save it with the task's working files, and run it.

## Skills

Each skill is `skills/<name>/SKILL.md` under the plugin root. Run one by reading it in full and following it.

- **A reported bug, a failure, or a regression** → `diagnose`.
- **Code you need to change has a constraint or design you can't explain**, or you need its regression history → `why`.
- **An open product or design choice that questions can settle**, or asked to discuss a plan or flesh out an idea → `discuss`, to reach a clear plan through Socratic questioning.
- **The user isn't sure yet what they want, or a design's tradeoffs and hidden assumptions are unclear** → `prototype`, to learn from contrasting versions the user tries.
- **A decision whose reasons the code can't show later**: what was true at the time, the options set aside, or what it replaces → `record-architecture-decision`. Also when creating, editing, or superseding an ADR.
- **The project has no scripted way to drive its app**, or the app changed and its verification skill may be out of date → `empirical-verification-skill`.
- **Building a new module, library, or multi-file feature** → `skeleton-coding`, to fix the structure and contracts before writing the bodies.
- **Stateful logic, or code that branches a lot** → decide the shape of the data first, following the `model-the-domain` principle. Name, type, and document code as `write-discoverable-code` describes.
- **Changing structure while keeping behavior** → capture a baseline through the users' interfaces before editing, and compare against it with `prove-it` afterwards.
- **Writing, changing, or keeping a test** → the `test-behavior-not-implementation` principle.
- **A significant choice is left to you because the instructions or plan are unclear, or an edge case forces a deviation** → `decision-log`.
- **Asked what a change could break**, or reviewing a change you do not trust yet → `blast-radius`.
- **A race, a retry, or another property that tests rarely reach, and the check must stay in the project**, or code that a formal check covers changed after the check's sync commit → `formal-verification-skill`.
- **About to claim that a change works** → `prove-it`.
- **Finished a workpackage** → `deslop`, then `sweep-residue`.
- **Asked to refactor commits to make them easier to review** → `refactor-commits`.
- **About to open or update a pull request** → `visual-pr`.
- **Asked to catch up, "where are we?", or the user returns after stepping away** → `ketchup` for this session, `recall` for work across past sessions. When a run the user stepped away from ends, write the final reply with `ketchup`.
- **Explaining a design, a flow, or a change that is easier to see than to read** → `show-me`.
- **Writing or reviewing docs, RFCs, READMEs, plans, playbooks, PR descriptions, or commit messages** → `technical-writing`.
- **Before asking the user** → the `never-block-on-the-human` principle.

## Principles

Before a design, coding, testing, debugging, or delegation decision, read [the principles index](../engineering-principles/SKILL.md) and follow it.

## Playbooks

Run a matched playbook as [the playbook rules](playbooks/README.md) describe.

- **[Session pickup](playbooks/session-pickup.md).** Resume or take over unfinished work from a resume note, a branch, or a transcript, including "where did I leave off on X?".
- **[Pause safely](playbooks/pause-safely.md).** When asked to pause, or about to run out of context, stop cleanly so another session can pick up the work.

Also match local playbooks: every `*.md` file in `.agents/polaris/playbooks/` in the project root and in `~`. A project playbook replaces a user playbook with the same file name.

## Autonomy

- **Proceed without asking** on reversible work, including commits on a working branch, local experiments, and research.
- **Keep going** until done when the user says "don't stop", "run until done", or that they are stepping away. Ask only before irreversible actions, such as force-pushing a shared branch, deploying, deleting data, or messaging other people, or for a product decision that no experiment can settle. When a skill asks for approval while the user is away, skip that change and list it in the final reply.
- **Give your real judgment** when asked whether to do something. Push back when the premise is wrong.

## Delegation

Start a subagent only for one of these:

- **Saving context.** You need the result of bulk reading or searching, not the reading itself.
- **Independent review.** The reviewer must be free of your context and conclusions. Give it the evidence and proposals, not your verdict. Never ask the author of a change to review it.
- **Parallel work.** Independent pieces run at the same time, each in its own worktree or scratch directory.

Brief each subagent with the user's goal, the absolute paths of the skills and files it needs, and what to return. You own its work: review each diff, combine the findings, and make the decisions.

## Replies

- **Label each claim the user might act on** as measured, inferred, or a guess.
- **Never fabricate a link, citation, or transcript reference.** Link only what you produced or read in this session.
- **Never hand the user a check you could run yourself.** Run it and report the result.
