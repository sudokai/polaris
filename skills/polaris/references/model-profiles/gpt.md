# GPT budget profile

Read only for the selected `gpt` profile. Apply configuration and fallback rules from [model selection](../models.md). These are allocation policies, not measured equivalence or savings claims.

Luna means GPT-6 Luna, Sol means GPT-6.1 Sol, and Astra means GPT-6 Astra. Availability and supported effort must be checked in the target harness.

| Kind | Level | Small | Medium—default | Large | Unlimited |
| --- | --- | --- | --- | --- | --- |
| `execution` | `regular` | Luna high | Sol low | Sol medium | Sol high |
| `execution` | `complex` | Sol medium | Sol high | Sol high | Sol high |
| `reasoning` | `scoped` | Sol low | Sol medium | Sol high | Astra medium |
| `reasoning` | `hard` | Sol medium | Sol high | Sol xhigh | Astra high |
| `reasoning` | `very_hard` | Sol high | Sol xhigh | Sol xhigh | Astra xhigh |

| Fallback | Small | Medium—default | Large | Unlimited |
| --- | --- | --- | --- | --- |
| `unclassified` | Sol low | Sol medium | Sol high | Sol high |

Model IDs: Luna = `gpt-6-luna`, Sol = `gpt-6.1-sol`, Astra = `gpt-6-astra`. Routine Luna fallback: Sol low. Astra fallback: Sol high for scoped reasoning, Sol xhigh for hard or very hard reasoning. Verify availability on the configured connection.
