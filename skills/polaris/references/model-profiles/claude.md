# Claude budget profile

Read only for the selected `claude` profile. Apply configuration and fallback rules from [model selection](../models.md). These are allocation policies, not measured equivalence or savings claims.

Model lines: Claude Haiku 5.5, Sonnet 5.5, Opus 5.5, and Fable 5.1. Availability and supported effort must be checked in the target harness.

| Kind | Level | Small | Medium—default | Large | Unlimited |
| --- | --- | --- | --- | --- | --- |
| `execution` | `regular` | Haiku high | Sonnet medium | Opus medium | Opus high |
| `execution` | `complex` | Opus medium | Opus high | Opus high | Opus high |
| `reasoning` | `scoped` | Opus low | Opus medium | Opus high | Fable medium |
| `reasoning` | `hard` | Opus medium | Opus high | Opus xhigh | Fable high |
| `reasoning` | `very_hard` | Opus high | Opus xhigh | Opus xhigh | Fable xhigh |

| Fallback | Small | Medium—default | Large | Unlimited |
| --- | --- | --- | --- | --- |
| `unclassified` | Opus low | Opus medium | Opus high | Opus high |

Model IDs: Haiku = `claude-haiku-5-5`, Sonnet = `claude-sonnet-5-5`, Opus = `claude-opus-5-5`, Fable = `claude-fable-5-1`. Resolve these through the selected connection; confirm supported efforts before spawning. Routine Haiku/Sonnet fallback: Opus low. Fable fallback: Opus high for scoped reasoning, Opus xhigh for hard or very hard reasoning.
