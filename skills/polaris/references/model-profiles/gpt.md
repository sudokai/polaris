# GPT budget profile

Read only for the selected `gpt` profile. Apply configuration and fallback rules from [model selection](../models.md). These are allocation policies, not measured equivalence or savings claims.

Luna means GPT-6 Luna, Sol means GPT-6.1 Sol, and Astra means GPT-6 Astra. Availability and supported effort must be checked in the target harness.

| Work | Small | Medium—default | Large | Unlimited |
| --- | --- | --- | --- | --- |
| `ordinary` | Luna high | Sol low | Sol medium | Sol high |
| `bounded_judgment` | Sol low | Sol medium | Sol high | Astra medium |
| `substantial_reasoning` | Sol medium | Sol high | Sol xhigh | Astra high |
| `hardest_reasoning` | Sol high | Sol xhigh | Sol xhigh | Astra xhigh |
| `hard_implementation` | Sol high | Sol xhigh | Sol xhigh | Sol xhigh |
| `verification` | Sol medium | Sol high | Sol xhigh | Sol xhigh |
| `unclassified` | Sol low | Sol medium | Sol high | Sol high |

Model IDs: Luna = `gpt-6-luna`, Sol = `gpt-6.1-sol`, Astra = `gpt-6-astra`. Routine Luna fallback: Sol low. Astra fallback: Sol high for bounded judgment, Sol xhigh for substantial/hardest reasoning. Verify availability on the configured connection.
