---
name: polaris-help
description: "Answer questions about using polaris: setup, starting a task with /polaris, and picking the skill, playbook, or principle for a situation. Use for /polaris-help with a question."
disable-model-invocation: true
---

# polaris help

Answer the user's question about polaris, give them a prompt they can send, and name the file the answer came from. For a help question, do not start the work. The user asked how, and a polaris run costs real tokens, so let them send the prompt.

A message that asks for work, such as "use polaris to fix this bug", is not a help question. Read the `polaris` skill (`../polaris/SKILL.md`) and do the work under it.

This file maps questions to the files that hold the answers. Those files own the details. Read the file you route to before you quote it, and trust it when it disagrees with this map. Give each command in the form the user's harness shows (`../polaris/references/harnesses.md`, **Typing a skill command**).

## Find out what they need

Infer the need from the message and the conversation. A named situation, such as "which skill checks what a change could break?", goes straight to its section. If the need is still unclear, ask one multiple-choice question with these options, then answer only the section they pick:

- Get set up
- Start a task with `/polaris`
- Pick a skill for a situation
- Fix a run that went wrong
- Make polaris my own

Check the state that changes the answer, and mention it only when it does:

- No model override file (`../polaris/references/locations.md`) means every role uses its default model. Mention `/setup-polaris` when the question is about setup, cost, or which models run.
- No `verify-<app>` skill or other app harness in the project means agents have no scripted way to drive the app. Mention the Set up verification playbook when the question is about proving a change works.
- No formal verification skill in the project means no property is checked past what tests reach. Mention `/create-formal-verification-skill` when the question is about a race, an invariant, or another case tests rarely hit.

## Get set up

1. Install polaris in each harness as the repository `README.md` says.
2. Run `/setup-polaris`. It shows the role table, lets the user change the model and effort for each role, and writes an override. Then it offers once each to set up app verification and formal verification for the project.
3. Start a real task with `/polaris`, a goal, and a check that can pass or fail.

Installing changes little until the user starts a task. The router runs only on `/polaris`. Seven skills start on their own when they fit: `prove-it`, `diagnose`, `fix-change-detector-tests`, `decision-log`, `prototype`, `restate-my-intent`, and `ketchup`. Offer to word the first prompt with the user, per [`references/prompting.md`](references/prompting.md).

If cost is the worry, say where the tokens go: subagents in `how`, `why`, `architect`, `recall`, and `reflect`. Running `/setup-polaris` again can move a role to a cheaper model or effort, or to `inherit`, which runs it on the session's model. Save `/polaris` for work that needs rigor.

## Start a task with `/polaris`

`/polaris` matches the task to a playbook, copies the playbook's steps into the todo list, and runs other skills as the steps need them. A step it skips stays in the list as `skip: <reason>`. A good prompt states the goal and how to tell it is done. It does not list skills, because a hand-written order tends to drop or reorder steps that the playbook keeps. Read [`references/prompting.md`](references/prompting.md) before you help word one.

Mid-session, "new task" makes the router match a fresh playbook.

## Pick a skill

The default answer is `/polaris`, which runs most of the others when its steps need them. Name a skill directly when the user wants more or less of something than the router gives. Read the skill before you recommend it, and give one example prompt.

| The user wants to | Skill |
|---|---|
| Do any nontrivial task with rigor | [`polaris`](../polaris/SKILL.md) |
| Check that the agent understood their goal and the problem before it starts | [`restate-my-intent`](../restate-my-intent/SKILL.md) |
| Aim a task higher before starting: more expert, more outcome-focused, not overspecified | [`sharpen`](../sharpen/SKILL.md) |
| Hear the last reply again in plain words | [`speak-human`](../speak-human/SKILL.md) |
| Know how code works now, or where new code should live | [`how`](../how/SKILL.md) |
| Know why code is shaped this way, or where a number came from | [`why`](../why/SKILL.md) |
| Catch up on their own recent work on a topic | [`recall`](../recall/SKILL.md) |
| Catch up on what changed in this session, with every call that waits on them | [`ketchup`](../ketchup/SKILL.md) |
| Know what a change could break outside itself | [`blast-radius`](../blast-radius/SKILL.md) |
| Settle types and module shape before code that crosses a function boundary | [`architect`](../architect/SKILL.md) |
| Try a design by hand before building it | [`prototype`](../prototype/SKILL.md) |
| Find the cause of a hard bug or a regression | [`diagnose`](../diagnose/SKILL.md) |
| Replace tests that break on refactors but catch no bugs | [`fix-change-detector-tests`](../fix-change-detector-tests/SKILL.md) |
| Prove or disprove that a change works | [`prove-it`](../prove-it/SKILL.md) |
| Give agents a scripted way to drive the app and prove behavior | [`create-verification-skill`](../create-verification-skill/SKILL.md) |
| Bring a verification skill and its feature map back in line with the app | [`maintain-verification-skill`](../maintain-verification-skill/SKILL.md) |
| Formally verify a race, an invariant, or another property that tests rarely reach | [`create-formal-verification-skill`](../create-formal-verification-skill/SKILL.md) |
| Bring a formal verification back in line after the code it covers changed | [`maintain-formal-verification-skill`](../maintain-formal-verification-skill/SKILL.md) |
| Run a large or cross-cutting change, or one to review after stepping away | [`figure-it-out`](../figure-it-out/SKILL.md) |
| Keep a decision log while implementing, and review it afterward | [`decision-log`](../decision-log/SKILL.md) |
| Pick a model and effort for each role | [`setup-polaris`](../setup-polaris/SKILL.md) |
| Turn what a session taught into durable lessons | [`reflect`](../reflect/SKILL.md) |
| Stop agents from repeating the same mistakes in this repo | [`correct`](../correct/SKILL.md) |
| Find their way around polaris | `polaris-help` |

If a skill directory next to this one is missing from the table, read its frontmatter and route by its description.

Close calls:

- `how` explains what the code does. `why` explains the reasons.
- `blast-radius` looks for breakage outside the diff and proves the one fact that makes the change safe. `prove-it` proves one claim about the change itself.
- `recall` rebuilds context across recent sessions. `ketchup` covers only this session since the user's last message. Resuming one specific session or branch is the Session pickup playbook.
- `prototype` is for a call a person must make. When the agent can make the call by running something, it runs the smallest script instead.

## Playbooks and principles

Playbooks are step lists inside `/polaris`, not skills, so they have no command. Inside `/polaris`, describing the task picks one. The Playbooks section of the `polaris` skill lists every bundled playbook and when it applies. A local playbook in `.agents/polaris/playbooks/` adds to them (`../polaris/references/locations.md`).

Principles are short rules in `../polaris/principles/` that `/polaris` reads and cites in its replies. The user rarely opens one. They steer with the names instead, as in "apply prove it works. show me the real output."

## Fix a run that went wrong

| Symptom | Fix |
|---|---|
| A question got treated as the next step of the last task | Say "new task", or say the turn does not need polaris. |
| A new model choice had no effect | Role agents load in a new session in some harnesses. Start one. |
| Runs cost more than expected | See the cost paragraph under **Get set up**. |
| A skill did not start on its own | Only the router and the seven skills under **Get set up** can start on their own. The others start from `/polaris` or when the user types them. |
| Parallel agents overwrote each other | Give each agent its own worktree. |
| An unattended run moved but finished nothing | Give it a check that can pass or fail, not a duration. |
| The reply claims success from a green build | Ask for the real command, flow, stored value, or profile. That is the Prove It Works principle. |

For a run that drifts, [`references/prompting.md`](references/prompting.md) has one-line steers.

## Make polaris my own

- `reflect` after a session turns its lessons into trigger lines, local playbooks, instruction-file lines, or fixes in the repo, and shows what it would change before it changes it.
- A local playbook in `.agents/polaris/playbooks/` in the project or in `~` adds a workflow without editing the plugin.
- Fix a misbehaving skill in its own change, not inside the feature work where it went wrong.

## Reply

Lead with the answer. Give at most one example prompt in a code block, adapted from [`references/recipes.md`](references/recipes.md) when one fits. Keep it short unless the user asked for the whole map.
