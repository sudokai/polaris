# Model budgets

Select a model–effort pair for each delegated assignment. Do not change the main conversation's model or start a subagent solely to obtain another model. Delegate only for useful parallel work, independent judgment, or bulk reading.

## Select a pair

1. Identify the harness from the session's tools. Read the current harness section from the project and user configuration files, if present. Do not read other sections or all profile tables.
2. Resolve settings with project > user > bundled precedence. Use a task-only budget if requested; it does not change saved settings or fixed overrides.
3. Classify the assignment by [kind and level](#assignment-kinds-and-levels). Read only the selected profile: [Claude](model-profiles/claude.md), [GPT](model-profiles/gpt.md), [xAI](model-profiles/xai.md), [DeepSeek](model-profiles/deepseek.md), or [GLM](model-profiles/glm.md).
4. Use the fixed override for that kind/level if present; otherwise select its budget column. If classification is uncertain, use the profile's separate `unclassified` allocation and reassess after initial exploration. Resolve the model ID through the configured connection and confirm the required tool/image support and effort. Never accept silent effort clamping.
5. Apply the pair using the [harness instructions](#apply-a-pair-in-each-harness). On a rejected allocation, follow [fallback rules](#fallbacks). Report the actual pair when it differs from the selected one.

Keep the resolved settings for this task; reread only when the user changes them or a capability failure requires a new resolution. Reuse a child's conversation only when its context and actual pair still fit the next assignment. Independent review starts fresh; continuation support is in [harness reference](harnesses.md).

## Assignment kinds and levels

Classify each delegated assignment with two fields. Levels belong to their kind; there is no shared difficulty scale across kinds.

| Kind | Level | Assignment |
| --- | --- | --- |
| `execution` | `regular` | Familiar implementation, source exploration, mechanical work, information extraction, or established checks with a clear approach and straightforward validation. Not limited to trivial edits. |
| `execution` | `complex` | Difficult execution against a settled design or specified procedure. |
| `reasoning` | `scoped` | Review, synthesis, or choosing among familiar approaches with limited uncertainty. |
| `reasoning` | `hard` | Finding an approach or explanation under unfamiliar behavior or competing constraints. |
| `reasoning` | `very_hard` | Exceptionally subtle problems or approaches requiring a major conceptual insight. |

```yaml
kind: reasoning
level: hard
```

Classify the assignment's main challenge, not the whole skill or activity. Finding an algorithm is reasoning; implementing an agreed algorithm is execution. If execution reveals an unresolved design decision, classify resolving it as a reasoning assignment.

Verification is an activity, not an allocation kind. Executing a specified procedure and collecting evidence uses execution at the appropriate level. Designing the procedure, diagnosing unexpected failures, or judging ambiguous evidence uses the appropriate reasoning level. Required capabilities, such as image input, still constrain the selected pair; resolve a suitable override or fallback when the selected allocation lacks them.

Consequences determine safeguards and independent review separately from reasoning difficulty. A familiar operation that could cause data loss may need rehearsal, recovery checks, and independent review without requiring very hard reasoning. Preserve each workflow's required coverage.

`unclassified` is a separate fallback allocation, not a third kind or a level. Use it only when classification is uncertain, state the uncertainty, and reassess after initial exploration. Its intermediate allocation is not evidence that it is sufficient for difficult unknown work.

Budgets are `small`, `medium` (default), `large`, and `unlimited`. They are allocation policies, not monetary caps or uniform effort offsets. Use the exact table entries. Prefer stronger models at lower effort where the table does so; avoid max when xhigh exists. Astra/Fable are for unlimited reasoning or explicit user overrides, not settled-design implementation. GLM Flash's broader eligibility is explicit in its profile.

| Harness | Default profile |
| --- | --- |
| `claude-code` | `claude` |
| `codex`, `pi` | `gpt` |
| `cursor`, `grok-build` | `xai` |
| `dsh` | `deepseek` |
| `hermes` | Suggest `gpt` during setup; existing delegation behavior remains unchanged. |

If the harness is unknown, do not guess that it can apply a pair. Report the limitation and follow [unavailable controls](#unavailable-controls).

## Configuration

Read `.agents/polaris/models.yaml` in the project root and the current harness's user model settings file from [locations](locations.md#user-model-settings). Their `harnesses` mapping contains sections identified by the harness names above; read only the current harness's section. Missing files/settings fall through to bundled defaults. Legacy `models.md` and role overrides are not read or migrated.

```yaml
harnesses:
  pi:
    profile: gpt
    budget: medium
    connection: openai
    overrides:
      execution:
        regular:
          model: gpt-6-luna
          effort: high
      unclassified:
        model: gpt-6.1-sol
        effort: medium
    fallbacks:
      reasoning:
        hard:
          - model: gpt-6.1-sol
            effort: high
          - model: claude-opus-5-5
            effort: high
            connection: anthropic
```

`connection` identifies an existing harness provider/account route, not a credential or a URL to invent. Omit it to use the harness's existing connection for the selected profile. If several routes fit, setup resolves and records the intended one. A pair can override `connection`; a cross-provider pair must name its configured connection. Resolve canonical IDs to the exact ID accepted by that route (for example, pi's `openai/gpt-6.1-sol`). Availability in another harness is not proof of availability here.

Merge by setting. Project `profile`, `budget`, and `connection` replace their user values; missing values fall through. Under `overrides` and `fallbacks`, nest entries by kind and then level. The optional `unclassified` entry is a sibling of the kinds: an atomic pair under `overrides`, or an ordered list under `fallbacks`. Each kind/level override is an atomic pair. Each kind/level fallback list is atomic, ordered, and replaces its lower-scope list. Omitted sibling levels remain inherited. An empty list disables that assignment's fallbacks, including bundled ones. The same precedence rules apply to `unclassified`. Without a configured list, use only the explicit bundled fallback described by the selected profile. A change to profile or connection does not reinterpret an inherited explicit override or fallback as another provider; validate its route and ask if ambiguous.

Pairs require `model` and the supported `effort`; omit effort for models such as Composer without a prescribed effort control. Overrides remain fixed across saved and task-only budget changes. Changing one requires an explicit instruction. Invalid profiles, budgets, kind/level combinations, incomplete pairs, and unknown connections are configuration errors: name the setting, explain the remedy, and pause the affected assignment. Do not overwrite configuration with unresolved choices or silently ignore invalid settings.

Flat category keys are not valid in this format. Report them as configuration errors and show the nested replacement; do not silently reinterpret or overwrite existing settings.

## Fallbacks

- Use configured fallback lists in order. Otherwise use only the selected profile's explicit bundled fallbacks. More expensive fallback pairs within that budget policy are permitted; another budget's allocations are not automatically authorized.
- Routine-model fallbacks are Luna → Sol low, Haiku/Sonnet → Opus low, and Composer → Grok low. If setup selects the xAI Grok-only table, it saves those allocations explicitly; runtime does not switch between tables implicitly.
- Missing Astra/Fable falls back to Sol/Opus: high for scoped reasoning, xhigh for hard or very hard reasoning. Other profiles can explicitly configure Astra/Fable for unlimited reasoning using their medium/high/xhigh reasoning progression; this requires the relevant connection and does not happen automatically.
- Stay on the intended connection unless an explicit fallback list authorizes another provider. An override alone authorizes its primary pair, not arbitrary cross-provider fallbacks. Do not silently use the session model after rejection.
- Use only documented model-specific effort mappings. If none exists, setup asks for a supported level and saves it. During execution, pause the assignment if its effort cannot be applied and no suitable fallback is available. Never invent GLM low or max on a model offering xhigh.
- Retry temporary failures once, then resolve fallback. Permission and unsupported-model errors go straight to fallback. Never retry a known rejected pair repeatedly or include the primary pair again in the fallback list.
- Every fallback must retain the task's required capabilities, including image input and independent review. A text-only model cannot collect visual evidence that requires seeing images.
- If no suitable authorized fallback exists, ask about the affected assignment and continue independent work. Do not replace independent review with self-review and call it equivalent.

Report substitutions once per task, grouping repeated uses of the same substitution: kind/level or unclassified, selected pair, actual pair/connection, and reason. When the harness exposes actual model/effort metadata, check it rather than trusting the requested values.

## Apply a pair in each harness

- **`codex`**: when the tool exposes `model` and `reasoning_effort`, set `fork_turns: "none"` and pass both. Full-context forks inherit the session pair; do not pretend overrides apply. Give fresh children a concise self-contained brief.
- **`claude-code`**: inspect the current spawn schema. Newer non-fork Agent invocations support both `model` and `effort`; prefer them. Otherwise select an agent definition fixing both fields, under [agent definitions](#agent-definitions). Environment-enforced model/effort settings and allowlists may override the request: check task metadata and report or resolve mismatches. See [Claude subagents](https://code.claude.com/docs/en/sub-agents#choose-an-effort-level).
- **`cursor`**: use the exact model slug/parameters accepted by the spawn tool. Pin standard Composer with `composer-2.5[fast=false]` or `composer-2.5[]`; do not use its default Fast tier as an economy allocation. Grok accepts low/medium/high/xhigh effort where available. Confirm the actual tier and pair on the task card/usage metadata. See [model parameters](https://cursor.com/docs/subagents#model-parameters).
- **`pi`**: inspect the installed extension's subagent schema; pi has no built-in subagents. Pass its accepted provider/model and thinking-level fields. Native thinking maps may silently lower unsupported effort, so validate the model's supported controls first.
- **`dsh`**: use `list_subagent_models` for allowed providers, IDs, and efforts. Pass `provider`, `model`, and `reasoning_effort` when exposed. Model selection must be enabled and requested by the preset. [Setup](../../setup-polaris/SKILL.md#1-identify-the-harness-and-its-controls) describes how to enable it; do not assume a missing field is present.
- **`grok-build`**: use a loaded agent definition fixing model and effort. Some sessions expose a model argument, but effort may still require a definition; use direct pair fields only when the actual schema supports both. Confirm that the connection accepts the definition's model; Composer may be callable even when `grok models` omits it. Do not infer that the CLI accepts an ID solely from Hermes's catalogue.
- **`hermes`**: leave its delegation settings unchanged. `delegate_task` uses its configured delegation model/effort, otherwise the parent's settings. Explain that kind/level selection does not apply; do not force Sol medium or launch separate processes to emulate them.

### Agent definitions

For Claude sessions without per-spawn effort and for Grok Build, select the loaded definition whose model, effort, and connection match the resolved pair. Never select by kind/level alone when an override or temporary budget changed the pair.

Bundled medium defaults and supported fallback pairs are in `../../../com.anthropic.claude-code/agents/` (Claude) and `../../../agents/` (Grok), relative to this file. Their names identify pairs, such as `opus-high` or `grok-high`. Composer definitions are generated only after setup confirms the route-specific ID; the bundled Grok pairs cover its supported primary and fallback allocations. The Claude manifest lists each agent file explicitly; do not put an `agents` field in the portable root manifest.

Setup writes one definition per distinct resolved pair, including configured fallbacks, to the selected project/user `.claude/agents/` or `.grok/agents/` directory. Use `polaris-<model>-<effort>` with punctuation replaced by hyphens, omitting effort for Composer. Include the connection's name in the filename when needed to distinguish routes. Frontmatter fields are `name`, `description`, `model`, and `effort` when prescribed. The body follows the assigned brief; it does not select another model, start agents, or load every profile. Definitions cannot create access to a provider the harness does not support.

A task-only budget uses matching loaded definitions or creates the needed definition without changing saved budget settings. If the harness needs a new session to load it, say so and pause that assignment; do not run another pair silently. Setup reads back generated definitions, preserves unrelated agents, and reports any reload requirement.

### Unavailable controls

If a harness cannot apply a pair, report that limitation; configured delegation behavior still applies where it exists. Do not claim the budget table took effect. If that behavior is unsuitable for the assignment, pause it. If no subagents exist, perform non-independent work directly; a required independent review remains unavailable and must be reported or resolved with the user.
