# Budgets select model–effort pairs by work category

Status: implemented in the source plugin. Live capability and cost comparisons are reported separately.

polaris replaces its four fixed model–effort roles with budget profiles that select pairs by the work assigned. The default budget is **medium**. Routine work can use smaller models with more effort; reasoning and difficult implementation retain strong models. This revisits the fixed-role policy in [ADR 0004](0004-skills-name-roles-not-models.md).

## Budget policy

- Offer four budgets: small, medium, large, and unlimited. They select model–effort pairs, not monetary limits or uniform effort levels.
- Compare complete pairs and the cost of completing the task, including corrections. Effort labels alone do not rank cost or capability across models.
- Prefer a stronger model at lower effort over pushing a smaller model to its limit when the work and budget permit it.
- By default, only confidently routine, well-defined work qualifies for models below the selected frontier model. Family profiles can explicitly assign a capable economy model to broader work categories, as the GLM profile does for Flash. If no routine model is configured, use the frontier fallback.
- Reserve Astra/Fable-class models for reasoning assignments under unlimited, or an explicit user override. Do not silently exceed the selected budget.
- Reasoning under unlimited uses the strongest class at medium, high, or xhigh according to difficulty. Difficult execution against a settled design stays on Opus/Sol.
- Avoid max whenever xhigh is available. Even breakthrough reasoning under unlimited uses xhigh, not max.
- Select the model through the budget profile, then preserve that model family during effort resolution. Do not silently substitute another provider.
- Some budgets can resolve to identical pairs when there is no useful supported distinction.

## Work categories

Classify each assignment by uncertainty and difficulty, rather than by its skill name or whether it writes code.

| Category | Meaning |
| --- | --- |
| Ordinary / routine | Familiar, bounded implementation, exploration, or mechanical work with clear instructions and straightforward verification. Not limited to trivial edits. |
| Bounded judgment | Review, synthesis, or choosing among familiar options with limited uncertainty. |
| Substantial reasoning / design | Resolving competing constraints, comparing designs, or reasoning through an unfamiliar problem. |
| Hardest reasoning / consequential architecture | Subtle reasoning, finding a fundamentally better approach, system design, or architectural choices with substantial uncertainty and costly consequences. |
| Hard implementation against a settled design | Difficult execution whose approach, boundaries, and constraints have already been decided. |
| Verification execution / evidence collection | Running the real verification procedure and capturing evidence. Judging whether that evidence proves correctness is a reasoning assignment. |
| Unclassified | Work that cannot confidently be assigned another category. Use the family's explicit unclassified allocation; otherwise, keep the frontier model. |

The reasoning rubric has three levels: bounded judgment, substantial reasoning, and hardest reasoning. Hardest/subtlest reasoning and breakthrough/consequential architecture share one level.

A task can contain several assignments. Finding a new algorithm is reasoning; implementing the agreed algorithm is execution. Choosing a helper signature or following an established module pattern does not automatically qualify as consequential architecture. A precisely specified task can still be very difficult.

## Profile tables

The runtime allocation tables live in the selected profile reference. Load one profile rather than every family:

- [Claude](../../skills/polaris/references/model-profiles/claude.md)
- [GPT](../../skills/polaris/references/model-profiles/gpt.md)
- [xAI, including the Grok-only fallback](../../skills/polaris/references/model-profiles/xai.md)
- [DeepSeek](../../skills/polaris/references/model-profiles/deepseek.md)
- [GLM](../../skills/polaris/references/model-profiles/glm.md)

These tables are authoritative; do not regenerate allocations through uniform effort offsets. Hermes retains its existing delegation behavior regardless of catalogue availability.

## Pair calibration

The routine Claude progression is Haiku high → Sonnet medium → Opus medium → Opus high. The GPT progression is Luna high → Sol low → Sol medium → Sol high.

The substitution heuristic Haiku high → Sonnet medium → Opus low compensates for a smaller model with more effort. It does not establish equal quality or equal cost. Luna is not a direct Sonnet substitute; Sol low is the medium-budget candidate for ordinary GPT implementation work.

These are selected defaults to evaluate, not measured claims of equivalent capability or savings. Evaluations must compare total task cost, missed findings, and correction work.

## Setup and portability

Configuration selects one provider profile and one budget, with optional per-category model–effort overrides. Medium is the default budget. Setup suggests the harness's default profile and allows any accessible profile. Both pi and Hermes default to GPT.

An override replaces its category's allocation and stays fixed when the budget changes. All categories without overrides follow the selected profile and budget. Setup shows the complete resolved table before saving, identifying fixed overrides and any fallback allocations.

A request to change the budget for the current task does not change saved settings or fixed overrides. Changing a fixed override requires an explicit instruction to change that override.

Connection details, including provider, authentication route, and harness-specific model IDs, remain separate from profile and budget selection. Work categories remain harness-neutral. No backward compatibility or migration layer is required for the old role configuration.

Offer the general xAI profile wherever its models are accessible, rather than limiting Composer to Cursor. Keep provider, authentication route, model ID, and supported controls separate from the harness's default family. A model missing from a listing is not sufficient evidence that the route cannot run it.

The budget applies where delegation already serves parallel work, independent judgment, or bulk reading. It does not justify starting a subagent solely to switch models or change the parent session's model.

### Fallback authorization

A budget profile can define explicit fallback pairs that cost more than its primary allocation. These remain authorized within that budget profile; do not infer permission to use another budget's allocations. For example, an unavailable Composer allocation can fall back to the profile's Grok-only allocation.

Cross-provider fallback requires an explicitly configured, ordered fallback list. Without that configuration, ask before switching providers. Model rejection alone does not authorize falling back to the session model when it would cross providers.

### Fallback allocations

- If a routine model is unavailable, use the profile's explicit frontier fallback: Luna → Sol low, Composer → Grok low, and Haiku/Sonnet → Opus low. These are fallback allocations, not a change to the primary budget tables.
- If Astra or Fable is unavailable, use Sol or Opus respectively: high for bounded judgment, and xhigh for substantial or hardest reasoning.
- Resolve unsupported effort through a documented model-specific mapping. If none exists, setup asks for a supported level and saves the choice. Do not use a generic nearest-level rule or introduce allocations excluded by the family profile.

Retry a temporary failure once before using the configured fallback. Permission errors and unsupported-model errors go directly to fallback resolution. Report substitutions once per task, identifying the model and effort actually used.

If no suitable authorized fallback exists, pause the affected assignment and ask the user while continuing independent work. Do not silently switch providers, discard required capabilities, or replace an independent review with a self-review and present it as equivalent.

### Hermes behavior

Leave Hermes's delegation behavior unchanged. Its existing delegation settings apply; when unset, children inherit the main conversation's settings. GPT is a setup suggestion, not an instruction to force Sol medium. Do not add separate-process delegation to implement category-based routing.

## Implementation

The runtime selection procedure, configuration syntax, and harness application rules are in [model budgets](../../skills/polaris/references/models.md). Setup writes YAML configuration and any required model-pair agent definitions.

Validation must distinguish:

- Fallback resolution from an actual successful model run. An unmapped failure pauses the affected assignment.
- Agent definition generation from loading and invocation in the target harness. Preserve the Hermes exception.
- Configuration checks from agent behavior. Configuration uses `models.yaml` sections per harness with project-over-user-over-bundled precedence; no legacy role migration is required.
- Representative evaluations for routine implementation, reasoning, verification, and fallback behavior. Compare total task cost, correctness, missed findings, and correction work; distinguish configuration checks from successful live model runs.

## Source of the design

pstack's [setup policy](https://github.com/cursor/plugins/blob/d457567332aa6989e753ea289f30ea2bfbc80bc0/pstack/skills/setup-pstack/SKILL.md#L20) and [per-assignment adjustments](https://github.com/cursor/plugins/blob/d457567332aa6989e753ea289f30ea2bfbc80bc0/pstack/skills/poteto-mode/SKILL.md#L95) inspired the budget system. The linked profile tables are authoritative for polaris; do not regenerate them by uniformly subtracting effort from a shared starting level.

Native effort constraints come from [Grok's reasoning documentation](https://docs.x.ai/developers/model-capabilities/text/reasoning) and [DeepSeek's thinking controls](https://api-docs.deepseek.com/guides/thinking_mode/). [DeepSeek's model catalogue](https://api-docs.deepseek.com/quick_start/pricing/) identifies the current Flash and Pro versions. Recheck capabilities during setup; these sources do not establish that pairs have equivalent quality.

The [GLM-5.3 documentation](https://docs.z.ai/guides/llm/glm-5.3) and [GLM-5.3-Flash documentation](https://docs.z.ai/guides/vlm/glm-5.3-flash) describe their input capabilities and thinking controls. The broader assignment of Flash is a selected policy to evaluate, not a measured claim of equivalence to GLM-5.3.

xAI's [Composer 2.5 announcement](https://x.ai/news/composer-2-5) confirms Grok Build availability. Cursor documents [Composer's standard and Fast tiers](https://cursor.com/docs/models/cursor-composer-2-5) and [subagent model parameters](https://cursor.com/docs/subagents). The installed Hermes sources `hermes_cli/models_catalog_static.py` and `agent/model_metadata.py` identify `grok-composer-2.5-fast` as an OAuth-only route; this source inspection does not prove current account entitlement or successful inference.
