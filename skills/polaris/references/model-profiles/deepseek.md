# DeepSeek budget profile

Read only for the selected `deepseek` profile. Apply configuration and fallback rules from [model selection](../models.md). These are allocation policies, not measured equivalence or savings claims.

All cells use `deepseek-flash`. Exclude Pro from defaults and fallbacks; do not assume it is an upgrade over the current Flash model.

DeepSeek's native thinking efforts are low, high, and max. Requested medium or xhigh maps to high. Use the explicit native allocations below rather than relying on that implicit conversion. Max remains eligible because there is no distinct xhigh level.

| Kind | Level | Small | Medium—default | Large | Unlimited |
| --- | --- | --- | --- | --- | --- |
| `execution` | `regular` | Low | Low | High | High |
| `execution` | `complex` | Low | High | High | High |
| `reasoning` | `scoped` | Low | High | High | Max |
| `reasoning` | `hard` | High | High | Max | Max |
| `reasoning` | `very_hard` | High | Max | Max | Max |

| Fallback | Small | Medium—default | Large | Unlimited |
| --- | --- | --- | --- | --- |
| `unclassified` | Low | High | High | High |

Complex execution uses low effort under small and high under the other budgets. This is a policy to evaluate, not a measured equivalence between the native effort levels.

Keep thinking enabled. Use native low/high/max values as written; do not pass medium or xhigh and rely on implicit conversion. No other model fallback is bundled.
