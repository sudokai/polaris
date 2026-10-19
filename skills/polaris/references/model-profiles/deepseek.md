# DeepSeek budget profile

Read only for the selected `deepseek` profile. Apply configuration and fallback rules from [model selection](../models.md). These are allocation policies, not measured equivalence or savings claims.

All cells use `deepseek-flash`. Exclude Pro from defaults and fallbacks; do not assume it is an upgrade over the current Flash model.

DeepSeek's native thinking efforts are low, high, and max. Requested medium or xhigh maps to high. Use the explicit native allocations below rather than relying on that implicit conversion. Max remains eligible because there is no distinct xhigh level.

| Work | Small | Medium—default | Large | Unlimited |
| --- | --- | --- | --- | --- |
| `ordinary` | Low | Low | High | High |
| `bounded_judgment` | Low | High | High | Max |
| `substantial_reasoning` | High | High | Max | Max |
| `hardest_reasoning` | High | Max | Max | Max |
| `hard_implementation` | High | Max | Max | Max |
| `verification` | High | High | Max | Max |
| `unclassified` | Low | High | High | High |

Keep thinking enabled. Use native low/high/max values as written; do not pass medium or xhigh and rely on implicit conversion. No other model fallback is bundled.
