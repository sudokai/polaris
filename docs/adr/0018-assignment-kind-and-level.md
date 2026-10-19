# Select models by assignment kind and level

The seven flat categories in [ADR 0017](0017-model-effort-budget-profiles.md) mixed work type, difficulty, and verification activity. Model selection now uses two fields: `kind` and `level`. This preserves the distinction between finding an approach and carrying out a settled approach without treating verification as a separate difficulty class.

## Classification

| Kind | Levels |
| --- | --- |
| `reasoning` | `scoped`, `hard`, `very_hard` |
| `execution` | `regular`, `complex` |

Reasoning includes design, architecture, investigation, research synthesis, and judgment. Execution includes implementation against a settled design, familiar exploration, extraction, mechanical work, and running specified checks. Classify each assignment by its main challenge. If implementation reveals an unresolved design question, resolving that question is a reasoning assignment.

Verification spans both kinds. Designing a verification loop or interpreting ambiguous evidence requires the appropriate reasoning level. Implementing an agreed harness and executing established checks use execution at the appropriate level. Tool and image capabilities still constrain every allocation.

Consequences determine safeguards and independent review coverage separately from reasoning difficulty. High stakes alone do not establish very hard reasoning. Preserve workflow requirements for independent review, rehearsal, and recovery checks.

`unclassified` remains a separate, temporary allocation for uncertain classification. It is not a third kind or a level. Reassess after initial exploration; its intermediate allocation is not inherently sufficient for difficult unknown work.

## Allocation policy

Preserve the existing reasoning, regular-execution, and unclassified allocations. Lower complex-execution effort as follows, preserving the model selected for each budget:

| Profile | Small | Medium | Large | Unlimited |
| --- | --- | --- | --- | --- |
| GPT | Sol medium | Sol high | Sol high | Sol high |
| Claude | Opus medium | Opus high | Opus high | Opus high |
| xAI | Composer | Grok medium | Grok high | Grok high |
| xAI Grok-only | Grok medium | Grok high | Grok high | Grok high |
| DeepSeek | Flash low | Flash high | Flash high | Flash high |
| GLM | Flash high | Flash high | GLM high | GLM high |

Composer has no prescribed effort control in this policy. DeepSeek uses native low/high/max steps, so lowering high to low is a coarser change than high to medium. GLM retains high as its policy floor. These are provisional allocations to evaluate, not measured claims of equivalent quality or savings. Existing [small comparisons](../model-budget-verification.md) do not establish optimal complex-execution effort.

The [profile references](../../skills/polaris/references/models.md) own the runtime definitions and exact tables. Configuration overrides and ordered fallback lists nest by kind and level, with `unclassified` as a separate sibling entry. Merge each kind/level independently so changing one level preserves inherited siblings. Flat category keys are configuration errors; do not silently reinterpret existing overrides. Model-pair agent definitions and budget precedence remain unchanged.
