---
name: polaris-help
description: "Answer questions about using polaris: setup, starting a task with /polaris, and picking the skill, playbook, or principle for a situation. Use for /polaris-help with a question."
disable-model-invocation: true
---

# polaris help

Answer the user's question about polaris, give them a prompt they can send, and name the file the answer came from. For a help question, do not start the work. The user asked how, and a polaris run costs real tokens, so let them send the prompt.

A message that asks for work, such as "use polaris to fix this bug", is not a help question. Read the `polaris` skill and do the work under it.

This file maps questions to the files that hold the answers. Those files own the details. Read the file you route to before you quote it, and trust it when it disagrees with this map. Give each command in the form the user's harness shows ([skill command syntax](../polaris/references/harnesses.md#typing-a-skill-command)).

## Find out what they need

Infer the need from the message and the conversation. A named situation, such as "which skill checks what a change could break?", goes straight to its section. If the need is still unclear, ask one multiple-choice question with these options, then answer only the section they pick:

- Get set up
- Start a task with `/polaris`
- Pick a skill for a situation
- Fix a run that went wrong
- Make polaris my own

Check the state that changes the answer, and mention it only when it does:

- No model configuration file ([location rules](../polaris/references/locations.md)) means assignments use the harness's default profile at medium budget, where the harness supports model selection. Mention `/setup-polaris` when the question is about setup, cost, or which models run.
- No `verify-<app>` skill or other app harness in the project means agents have no scripted way to drive the app. Mention the Set up verification playbook when the question is about proving a change works.
- No formal verification skill in the project means no property is checked past what tests reach. Mention `/create-formal-verification-skill` when the question is about a race, an invariant, or another case tests rarely hit. When one exists and the code it covers changed after the commit it records as last in sync, mention `/maintain-formal-verification-skill` if the question touches that code.

## Get set up

1. Install polaris in each harness using the [installation instructions](../../README.md#install).
2. Run `/setup-polaris`. It shows the profile and budget table, offers fixed kind/level overrides and fallbacks, and saves configuration for the chosen scope. Harness limitations are reported rather than silently ignored. Then it offers once each to set up app verification and formal verification for the project.
3. Start a real task with `/polaris`, a goal, and a check that can pass or fail.

Installing changes little until the user starts a task. The router runs only on `/polaris`. Eighteen skills start on their own when they fit: `prove-it`, `diagnose`, `no-change-detector-tests`, `decision-log`, `prototype`, `restate-my-intent`, `ketchup`, `discuss`, `define-domain-language`, `model-domain`, `record-architecture-decision`, `tdd`, `write-discoverable-code`, `deslop`, `sweep-residue`, `walkthrough`, `technical-writing`, and `deslop-language`. Offer to word the first prompt with the user, per `references/prompting.md`.

If cost is the worry, start with delegation: reuse evidence, follow a settled design directly, and expand `why` and `recall` searches for concrete gaps. Independent review scales with consequences; comprehensive investigation remains available on request. Running `/setup-polaris` can select a different budget or profile. A task-only budget request leaves saved settings and fixed overrides unchanged; [model selection](../polaris/references/models.md) defines the selection and fallback rules. Save `/polaris` for work that needs rigor.

## Start a task with `/polaris`

`/polaris` matches the task to a playbook, copies the playbook's steps into the todo list, and runs other skills as the steps need them. A step it skips stays in the list as `skip: <reason>`. A good prompt states the goal and how to tell it is done. It does not list skills, because a hand-written order tends to drop or reorder steps that the playbook keeps. Read `references/prompting.md` before you help word one.

Mid-session, "new task" makes the router match a fresh playbook.

## Pick a skill

The default answer is `/polaris`, which runs most of the others when its steps need them. Name a skill directly when the user wants more or less of something than the router gives. Read the skill before you recommend it, and give one example prompt.

| The user wants to | Skill |
|---|---|
| Do any nontrivial task with rigor | `polaris` |
| Check that the agent understood their goal and the problem before it starts | `restate-my-intent` |
| Get a prompt rewritten deeper, not bigger, before sending it: what a top professional would add, their raw material and methods, and an outside check. It returns the prompt and doesn't do the task | `sharpen` |
| Translate AI prose into plain human language | `say-it-plainly` |
| Save a settled design as a standalone implementation plan | `finalize-plan` |
| Settle a plan or a design through a few rounds of questions, before any code | `discuss` |
| Sharpen the project's terms and record them in `GLOSSARY.md` | `define-domain-language` |
| Understand and document existing domain relationships and rules | `model-domain` |
| Record or update an architectural decision and its reasoning | `record-architecture-decision` |
| See the current topic as a diagram, a code-shape sketch, or an HTML page | `show-me` |
| Know how code works now, or where new code should live | `how` |
| Know why code is shaped this way, or where a number came from | `why` |
| Understand a PR, a branch, a commit, or a diff, stage by stage, ending with a quiz | `walkthrough` |
| Catch up on their own recent work on a topic | `recall` |
| Catch up on what changed in this session, with every call that waits on them | `ketchup` |
| Know what a change could break outside itself | `blast-radius` |
| Design a substantial program, system, product, or codebase foundation before implementation, including types and interfaces | `architect` |
| Try a design by hand before building it | `prototype` |
| Build a feature or fix a bug test-first, one test at a time | `tdd` |
| Write or review docs, RFCs, READMEs, plans, playbooks, PR descriptions, or commit messages | `technical-writing` |
| Remove AI writing patterns from prose | `deslop-language` |
| Write code that a plain-text search finds in one try | `write-discoverable-code` |
| Simplify just-finished work without changing what it does | `deslop` |
| Strip leftovers of the conversation from finished code and docs | `sweep-residue` |
| Open or update a PR with a short, visual description | `visual-pr` |
| Find the cause of a hard bug or a regression | `diagnose` |
| Replace tests that break on refactors but catch no bugs | `no-change-detector-tests` |
| Prove or disprove that a change works | `prove-it` |
| Give agents a scripted way to drive the app and prove behavior | `create-verification-skill` |
| Bring a verification skill and its feature map back in line with the app | `maintain-verification-skill` |
| Formally verify a race, an invariant, or another property that tests rarely reach | `create-formal-verification-skill` |
| Bring a formal verification back in line after the code it covers changed | `maintain-formal-verification-skill` |
| Show a PM or designer what the user sees as a chart checked by a TLA+ model, with the shortest path to each state that breaks a rule | `statechart` |
| Design a task-specific playbook when no existing one fits | `figure-it-out` |
| Keep a decision log while implementing, and review it afterward | `decision-log` |
| Choose a model profile, budget, and kind/level overrides | `setup-polaris` |
| Turn what a session taught into durable lessons | `reflect` |
| Stop agents from repeating the same mistakes in this repo | `correct` |
| Find their way around polaris | `polaris-help` |

If a skill directory next to this one is missing from the table, read its frontmatter and route by its description.

Close calls:

- `how` explains what the code does. `why` explains the reasons. `walkthrough` explains a change: what it is for and how its parts fit.
- `blast-radius` looks for breakage outside the diff and proves the one fact that makes the change safe. `prove-it` proves one claim about the change itself.
- `recall` rebuilds context across recent sessions. `ketchup` covers only this session since the user's last message. Resuming one specific session or branch is the Session pickup playbook.
- `prototype` is for a call a person must make. When the agent can make the call by running something, it runs the smallest script instead.
- `sharpen` rewrites the user's prompt in one turn, without asking, and doesn't do the task. `discuss` asks the user over several rounds and stops before any code.
- `finalize-plan` saves a settled design from any source as an implementation plan. `figure-it-out` designs an execution playbook. Their caller owns sequencing.
- `technical-writing` covers document structure and style. `deslop-language` removes AI writing patterns. `say-it-plainly` translates selected prose using the surrounding context.
- `deslop` simplifies the design of finished work. `sweep-residue` then removes what only makes sense to someone who saw the conversation.
- `tdd` writes tests in red-green cycles. `no-change-detector-tests` evaluates whether a proposed test should exist and audits existing tests for useful behavior coverage.
- `architect` returns a design and revisits it when evidence invalidates it. A design-only request ends there. If the user also requested implementation, the invoking agent continues that work directly or through a playbook.

## Playbooks and principles

Playbooks are step lists inside `/polaris`, not skills, so they have no command. Inside `/polaris`, describing the task picks one. The Playbooks section of the `polaris` skill lists every bundled playbook and when it applies. A local playbook in `.agents/polaris/playbooks/` adds to them ([location rules](../polaris/references/locations.md)).

For implementation, feature development, bug fixes, and refactoring each have a playbook. They own sequencing, handoffs, checks, and delivery; the skills they call own their methods. The other bundled playbooks cover verification setup, session pickup, and safe pauses. `figure-it-out` designs a task-specific playbook when none fits. Requests only for planning, investigation, explanation, or design stay within that scope.

Each principle is a hidden skill named `principle-<slug>`, such as `principle-prove-it-works`. Run that command to apply the rule to the current task. `/polaris` reads the same skill when a task triggers it, and cites the decision it changed. You can also steer by name, as in "apply prove it works. show me the real output."

## Fix a run that went wrong

| Symptom | Fix |
|---|---|
| A question got treated as the next step of the last task | Say "new task", or say the turn does not need polaris. |
| A new model choice had no effect | Role agents load in a new session in some harnesses. Start one. |
| Runs cost more than expected | See the cost paragraph under **Get set up**. |
| A skill did not start on its own | Only the router and the sixteen skills under **Get set up** can start on their own. The others start from `/polaris` or when the user types them. |
| Parallel agents overwrote each other | Give each agent its own worktree. |
| An unattended run moved but finished nothing | Give it a check that can pass or fail, not a duration. |
| The reply claims success from a green build | Ask for the real command, flow, stored value, or profile. That is the Prove It Works principle. |

For a run that drifts, `references/prompting.md` has one-line steers.

## Make polaris my own

- `reflect` after a session turns its lessons into trigger lines, local playbooks, instruction-file lines, or fixes in the repo, and shows what it would change before it changes it.
- A local playbook in `.agents/polaris/playbooks/` in the project or in `~` adds a workflow without editing the plugin.
- Fix a misbehaving skill in its own change, not inside the feature work where it went wrong.

## Reply

Lead with the answer. Give at most one example prompt in a code block, adapted from `references/recipes.md` when one fits. Keep it short unless the user asked for the whole map.
