# Implementation Plan: Model–Effort Budgets

Status: historical implementation plan for ADR 0017. Assignment classification, configuration keys, and execution allocations are superseded by [ADR 0018](docs/adr/0018-assignment-kind-and-level.md); use [model selection](skills/polaris/references/models.md) for current instructions.

## Goal

Replace polaris's four fixed delegation roles with model–effort allocations selected by work category and budget. Reduce total task cost without weakening reasoning quality, adding unnecessary agents, or changing the main conversation's model. The accepted tables and their rationale are in `docs/adr/0017-model-effort-budget-profiles.md`; read that file in full before implementation. This plan covers the source plugin, configuration, harness integration, and verification.

## Decisions

- Use four budgets: small, medium, large, and unlimited. Default to medium. Budgets select complete model–effort pairs because effort labels alone do not express cost or capability.
- Use seven assignment categories: ordinary, bounded judgment, substantial reasoning, hardest reasoning, hard implementation, verification execution, and unclassified. Classify each assignment rather than an entire skill. Difficult execution against a settled design differs from finding the design; interpreting verification evidence differs from collecting it.
- Implement the exact Claude, GPT, xAI, DeepSeek, and GLM tables in ADR 0017. Do not reconstruct them from uniform effort offsets. The tables are selected policies to evaluate, not proven capability equivalences.
- Default Claude Code to Claude, Codex and pi to GPT, Cursor and Grok Build to xAI, and DeepSeek Harness to DeepSeek. Suggest GPT for Hermes without changing its actual delegation behavior. Allow another accessible profile in every harness that can apply it.
- Give Astra/Fable-class models unlimited-budget reasoning assignments, not implementation against a settled design. Use medium, high, and xhigh according to the accepted tables. Avoid max when xhigh exists; DeepSeek and GLM may use max because they lack a distinct xhigh level.
- Keep DeepSeek Flash as the only default DeepSeek model. Use GLM Flash broadly according to its table, never GLM low. Do not infer quality from model names or treat a faster variant as cheaper.
- Treat xAI as a general profile combining Composer 2.5 and Grok 4.7. Cursor standard Composer is `composer-2.5[fast=false]`; Hermes's catalogue identifies `grok-composer-2.5-fast` as an OAuth route. Resolve availability and controls per connection. Do not transfer Cursor pricing or standard-tier assumptions to the OAuth route. Missing catalogue entries alone do not prove unavailability.
- Delegate only for useful parallel work, independent judgment, or bulk reading. Keep the recently simplified workflow sizes, focused prompts, and conditional agent reuse. Selecting a cheaper model does not justify another subagent, and Composer execution does not require automatic Grok review.
- Save a profile and budget per harness, with optional fixed category overrides. Overrides survive budget changes because they express explicit choices. A task-only budget request changes neither saved configuration nor fixed overrides.
- Use project configuration over user configuration over bundled defaults. No compatibility or migration layer for the old role configuration is required. Do not delete unrelated user files while removing legacy support from the plugin.
- Permit explicit within-profile fallback pairs to cost more than the primary allocation. Require a configured ordered list or user approval before switching providers. Report substitutions once per task, including the model and effort actually used.
- Leave Hermes built-in delegation unchanged: use its existing delegation settings, otherwise inherit the parent settings. Do not force Sol medium, rewrite its global settings between tasks, or introduce separate-process delegation.

## Deferred / Out of Scope

- New provider families, including Gemini, Kimi, Qwen, and MiniMax profiles.
- Monetary caps, token accounting services, automatic benchmark-based routing, or automatic cost-driven model upgrades.
- Hermes per-assignment model selection, separate Hermes processes, and changes to harness implementations.
- Restoring the old four-role format or translating legacy user overrides automatically.
- Changing parent-session models, increasing workflow fan-out, or adding reviews solely because a cheaper model performed implementation.
- Publishing, pushing, or claiming measured savings before representative comparisons exist. Installation refresh is a separate completion action governed by the repository install skill; it must not silently change personal model settings.

## Architecture

The plugin is primarily an instruction package. Keep model selection as a short, explicit procedure; do not introduce a routing service or orchestration framework.

```text
Assignment + active harness + task-only budget, if any
                         |
Project models.yaml > user models.yaml > bundled defaults
                         |
Selected profile + budget + fixed category override
                         |
Capability checks + authorized fallback resolution
                         |
Per-spawn fields OR harness agent definition
                         |
Actual model/effort report when substitution occurs
```

Use these responsibilities:

- `skills/polaris/references/models.md`: category definitions, configuration precedence, selection procedure, fallback policy, and harness application instructions.
- `skills/polaris/references/model-profiles/{claude,gpt,xai,deepseek,glm}.md`: one authoritative allocation table and native capability constraints per profile. Load only the selected profile, plus an explicitly authorized fallback profile if needed. Do not repeat every table in each skill.
- `skills/setup-polaris/SKILL.md`: detect capabilities, select profile/budget, resolve every category, show the result, and save configuration and any required agent definitions.
- Harness agent definitions: thin briefs for harnesses that cannot set the pair directly. Setup generates the current effective definitions; source definitions provide the bundled medium default where supported.
- `scripts/check_plugin.py`: retain existing validation and recognize the deliberately harness-specific profile references. Extend structural checks only where they catch broken links, registrations, or invalid shipped allocations.

### Configuration

Use `.agents/polaris/models.yaml` and `~/.agents/polaris/models.yaml`. Start with this concrete format:

```yaml
harnesses:
  pi:
    profile: gpt
    budget: medium
    overrides:
      ordinary:
        model: gpt-6-luna
        effort: high
```

Use stable category keys: `ordinary`, `bounded_judgment`, `substantial_reasoning`, `hardest_reasoning`, `hard_implementation`, `verification`, and `unclassified`. Use `profile` values `claude`, `gpt`, `xai`, `deepseek`, and `glm`.

Merge by setting: a project value replaces the corresponding user value; omitted values fall through. Override entries are atomic model–effort pairs. Ordered fallback lists replace the lower-scope list rather than concatenate it. Removing a project entry reveals the user setting. Keep sections for other harnesses intact when saving.

Use canonical profile model IDs in allocations and resolve harness-specific IDs through its capability source. An explicit pair using another provider must identify its existing connection; never infer a credential route from a model name. Connection references identify existing harness configuration, not stored secrets. If a harness offers several routes, setup records which configured connection is intended.

Represent optional explicit fallbacks as an ordered per-category list of complete pairs with a connection reference when needed. Finalize its field spelling in `models.md`, provide one example, and use it consistently in setup. Avoid adding a configuration parser dependency unless a deterministic setup/generation helper actually needs one.

Setup displays profile, budget, override sources, effective pairs, fallbacks, and any harness limitation before saving. Validate model eligibility, required image/tool support, and effort support. An unavailable required model remains an unresolved allocation until an authorized fallback is selected; do not claim the table is usable merely because it was written.

### Fallbacks and errors

- Routine-model fallbacks are Luna → Sol low, Composer → Grok low, and Haiku/Sonnet → Opus low. These explicit fallback pairs do not alter primary allocation tables.
- Missing Astra/Fable falls back to Sol/Opus: high for bounded judgment, xhigh for substantial or hardest reasoning.
- Keep the full Grok-only fallback table from ADR 0017 for xAI routes without Composer. If Composer disappears after setup, use the explicit saved per-category fallback; do not choose between different fallback tables implicitly.
- Preserve GLM image support: GLM-5.3 is text-only, so visual evidence collection must retain a vision-capable allocation.
- Map unsupported effort only through documented model-specific rules. DeepSeek's native table already avoids generic medium/xhigh conversion. Do not assume a generic nearest-effort rule is valid or silently accept a harness's default downgrade.
- If no supported mapping exists, setup asks for and saves a supported level. During a task, pause only the affected assignment when no suitable authorized fallback exists; continue independent work.
- Retry a temporary failure once, then use a configured fallback. Permission and unsupported-model errors go directly to fallback resolution. Do not retry in an unbounded loop or treat a timeout as permission to switch providers.
- Do not silently use the session model after rejection if doing so violates the selected connection, budget policy, required capabilities, or independence of a review.

## Step-by-Step

1. **Read the context and establish the baseline.** Read every file listed at the end of this plan before writing code. Check the worktree, preserve existing plans and unrelated changes, and run `python3 scripts/check_plugin.py`. Start the decision log for implementation. Use `write-discoverable-code` for code and `write-clearly` for instructions and documentation.
2. **Define profile references and configuration.** Extract the five accepted tables from ADR 0017 into the profile reference files. Preserve all seven categories and four budgets exactly. Rewrite `models.md` with the format, defaults, precedence, task-only behavior, explicit overrides, fallback rules, and progressive loading instructions. Update `locations.md` for YAML paths. Adjust validator harness-fact exceptions for the new reference directory.
3. **Update setup and harness application.** Replace the four-role interview with profile/budget selection and optional overrides. Use native catalogue/tool capabilities, while accounting for callable models omitted from listings. Keep credentials in the harness. Codex uses explicit model/effort with fresh child context when its tool requires it; Cursor uses supported model parameters; pi depends on the installed subagent extension; DeepSeek Harness depends on model-selection settings and preset fields. Verify these interfaces against the tools actually available. For Hermes, explain its limitation and leave delegation settings untouched.
4. **Replace fixed-role agent definitions.** For Claude Code and Grok Build, generate thin definitions for distinct resolved pairs, sharing a definition when categories resolve to the same pair. Register only the necessary shipped defaults; allow setup to write project/user definitions for other budgets and overrides. A task-only budget can use existing definitions or create the required task-specific definition without persisting a different budget; if a new session is needed, report that limitation before starting the assignment. Do not claim unsupported dynamic selection works. Keep Claude and Grok definition directories separate and retain the portable root manifest's restrictions.
5. **Classify workflow assignments.** Replace actual role references in architect, blast-radius, how, maintain-verification-skill, recall, reflect, why, and session-pickup. Routine exploration/mining usually uses ordinary; familiar review uses bounded judgment; uncertain design uses substantial or hardest reasoning; evidence collection uses verification. Keep the category sensitive to the actual assignment. Do not mechanically convert every `deep` to one category or every judge to hardest. Preserve independent-review context isolation and existing fan-out limits.
6. **Update discovery and documentation.** Update router guidance, README, locations, setup descriptions, and manifests to describe budgets/categories. Mark ADRs 0004/0005 as superseded only where policy changes, preserving their historical rationale. Keep ADR 0017 as the decision record, with runtime tables pointing to the new authoritative profile references after implementation. Do not claim model availability or cost savings beyond verified evidence.
7. **Verify behavior and review the result.** Apply `no-change-detector-tests` before adding tests. Run structural checks and meaningful scenario checks, inspect generated definitions, and execute targeted live checks where available. Run `deslop`, followed by `sweep-residue`, on the completed workpackage. Refresh installed copies only through the installation skill and report restart/load gaps accurately.

**Handling errors:** configuration errors identify the harness, category, invalid setting, and remedy. Do not overwrite a valid file with unresolved settings. Model failures follow the bounded fallback procedure; independent review remains independent or is explicitly blocked. Verify the model/effort actually used when the harness exposes it.

**Tests:** use behavioral scenarios for configuration precedence, fixed overrides, temporary budgets, unavailable models, unsupported effort, and provider authorization. If a helper is introduced, give it executable tests for those outcomes; do not add tests that merely compare generated text to its own template. For instruction-only behavior, use fresh-session scenario prompts and inspect selections and task cards rather than claim unit tests prove agent compliance. Extend the existing validator only for structural invariants it can actually establish.

## Acceptance Criteria

- `python3 scripts/check_plugin.py` prints `ok`; `git diff --check` passes.
- All five profile references reproduce the accepted 7 × 4 allocation tables in ADR 0017. GPT medium ordinary resolves to Sol low, Claude medium ordinary to Sonnet medium, and xAI medium ordinary to Composer with a verified route/tier.
- GLM has no low allocation, DeepSeek has no Pro allocation, and Grok build-fast is never presented as an economy fallback. Astra/Fable allocations follow the reasoning eligibility and xhigh ceiling.
- Project values override user values without discarding unrelated harness settings. A fixed ordinary Luna-high override survives a temporary small/large budget request. That request does not modify saved files.
- Setup offers GPT by default for pi and Hermes. Hermes's personal delegation configuration is unchanged and its effective behavior is described accurately.
- Missing Composer uses the configured explicit Grok fallback; missing Astra/Fable uses the accepted Sol/Opus fallback. Unsupported effort without a documented mapping produces a choice/block rather than silent clamping. Image-required work never falls back to text-only GLM.
- A temporary failure gets at most one retry. A configured cross-provider fallback follows its saved order; without authorization, only the affected assignment pauses. Substitution reporting identifies the actual pair once per task.
- Generated Claude/Grok definitions are loadable and registered correctly on tested harnesses. Distinguish successful generation from actual loading; verify at least one ordinary and one reasoning assignment on each available distinct selection mechanism, or report the exact unverified mechanism.
- A routine task does not acquire new subagents solely to change models, and an independent reviewer receives a fresh brief without the parent's preferred conclusion. Reduced workflow sizes and conditional reuse remain intact.
- Compare baseline and budget behavior on representative routine implementation, reasoning/review, and verification assignments using the same inputs and correctness criteria. Record selected/actual pairs, available token/cost data, missed findings, retries, and correction work. Do not claim savings from token counts alone or from unexecuted comparisons.
- Search executable instructions and live manifest registrations for old role names; remaining occurrences describe history or ordinary English, not active routing. Do not remove unrelated uses of words such as standard or fast.

## Read These Files

Read every file below in full before writing code. ADR 0017 contains every accepted model table; the other ADRs explain the existing packaging constraints.

- `docs/adr/0017-model-effort-budget-profiles.md`
- `docs/adr/0004-skills-name-roles-not-models.md`
- `docs/adr/0005-role-agents-for-claude-code-and-grok-build.md`
- `skills/polaris/references/models.md`
- `skills/polaris/references/harnesses.md`
- `skills/polaris/references/locations.md`
- `skills/setup-polaris/SKILL.md`
- `skills/polaris/SKILL.md`
- `skills/architect/SKILL.md`
- `skills/architect/references/runner-prompt.md`
- `skills/architect/references/rationale-template.md`
- `skills/architect/references/design-red-flags.md`
- `skills/blast-radius/SKILL.md`
- `skills/how/SKILL.md`
- `skills/how/references/explanation-format.md`
- `skills/maintain-verification-skill/SKILL.md`
- `skills/recall/SKILL.md`
- `skills/why/SKILL.md`
- `skills/reflect/SKILL.md`
- `skills/reflect/references/session-reviewer.md`
- `skills/reflect/references/judgment-reviewer.md`
- `skills/reflect/references/environment-reviewer.md`
- `skills/reflect/references/divergent-reviewer.md`
- `skills/reflect/references/history-miner.md`
- `skills/reflect/references/synthesizer.md`
- `skills/polaris/playbooks/session-pickup.md`
- `skills/decision-log/SKILL.md`
- `skills/write-discoverable-code/SKILL.md`
- `skills/no-change-detector-tests/SKILL.md`
- `skills/deslop/SKILL.md`
- `skills/sweep-residue/SKILL.md`
- `scripts/check_plugin.py`
- `README.md`
- `GLOSSARY.md`
- `docs/README.md`
- `docs/open-work.md`
- `plugin.json`
- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `.cursor-plugin/plugin.json`
- `.agents/skills/install-polaris/SKILL.md`
- `cordis.patch.yml`
- `agents/deep.md`
- `agents/fast.md`
- `agents/standard.md`
- `agents/ultra.md`
- `com.anthropic.claude-code/agents/deep.md`
- `com.anthropic.claude-code/agents/fast.md`
- `com.anthropic.claude-code/agents/standard.md`
- `com.anthropic.claude-code/agents/ultra.md`

Recheck the installed harness's public tool schema and model capabilities during implementation. The Hermes source files `tools/delegate_tool.py`, `tools/delegate_tool_config.py`, `hermes_cli/models_catalog_static.py`, and `agent/model_metadata.py` under its installation directory substantiate the current exception and Composer OAuth route; they are evidence sources, not plugin files to modify. Follow the primary-source links in ADR 0017 when local capabilities are incomplete.
