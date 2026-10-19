# Assignment classification assessment

Assessed on October 19, 2026 against local ADRs, Git history, workflow instructions, and recorded evaluations.

## Recommendation

Use two assignment fields: `kind` and `level`, with five supported combinations and a separate `unclassified` allocation. [ADR 0018](adr/0018-assignment-kind-and-level.md) records the decision and execution-effort reductions. Keep consequences as a separate reason for safeguards and independent review. These are allocation policies to evaluate, not measured optimal boundaries.

## Why the categories exist

[ADR 0004](adr/0004-skills-name-roles-not-models.md) centralized model and effort selection behind four roles: `fast`, `standard`, `deep`, and `ultra`. In the version before commit `561e4a6`, `deep` combined design, synthesis, and hard code changes. Those assignments could not receive different allocations through that role alone. Inspect with `git show 561e4a6^:skills/polaris/references/models.md`.

Commit `2523a88` scaled delegation to uncertainty and consequences: settled designs could proceed directly, moderate uncertainty received a reviewer, and consequential commitments received independent designs and a judge. This concerns review coverage as well as model selection. Inspect with `git show 2523a88 -- skills/architect/SKILL.md skills/blast-radius/SKILL.md`.

Commit `561e4a6` introduced budget profiles and seven work categories. [ADR 0017](adr/0017-model-effort-budget-profiles.md) explicitly distinguishes finding an algorithm from implementing an agreed algorithm. It also reserves the strongest model class for some reasoning allocations while keeping difficult implementation on the execution model family. These are intentional policy distinctions, not accidental duplication.

## Assignment boundaries

- **Reasoning:** scoped for familiar judgment; hard for discovering an approach under unfamiliar or competing constraints; very hard for exceptional subtlety or a major conceptual insight.
- **Execution:** regular for familiar work with clear checks; complex for difficult execution against a settled approach.
- **Unclassified:** a temporary allocation when kind and level are not yet clear, followed by reassessment after initial exploration.

Verification is an activity spanning both kinds. Designing a loop and interpreting ambiguous evidence use reasoning; implementing a settled harness and executing specified checks use execution. The [GLM profile](../skills/polaris/references/model-profiles/glm.md) also makes image capability a selection constraint.

A familiar but dangerous operation may need independent checks without requiring conceptual breakthrough reasoning. The [blast-radius workflow](../skills/blast-radius/SKILL.md) varies review coverage by consequences. Developing a migration strategy, implementing the settled migration, and executing its prescribed rehearsal are separate assignments; classify each one's main challenge without creating agents merely to switch models.

## Evidence limits

The [verification record](model-budget-verification.md) contains three small comparisons, not representative coverage of every category. It explicitly says the seeded correctness review does not justify its assigned reasoning level. The verification comparison uses the same Sol-high pair on both sides, so it cannot establish that a cheaper pair would be inadequate. The record labels general savings inconclusive. These are recorded results; they were not rerun for this assessment.

The history supports the intent behind the distinctions. It does not prove that their boundaries are consistently applied or that all allocations are optimal. Evaluate the five combinations with realistic assignment examples, check classification disagreements, and compare task completion quality and total cost for adjacent allocations.
