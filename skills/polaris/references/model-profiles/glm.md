# GLM budget profile

Read only for the selected `glm` profile. Apply configuration and fallback rules from [model selection](../models.md). These are allocation policies, not measured equivalence or savings claims.

Flash means GLM-5.3-Flash; GLM means GLM-5.3. Use no low-effort allocations. Flash handles routine implementation, bounded judgment, and verification, with GLM allocated to deeper reasoning and the most demanding implementation.

Both models support low, high, and max thinking effort. Use the explicit high/max allocations here. Max remains eligible because neither model offers a distinct xhigh level.

| Work | Small | Medium—default | Large | Unlimited |
| --- | --- | --- | --- | --- |
| `ordinary` | Flash high | Flash high | Flash max | Flash max |
| `bounded_judgment` | Flash high | Flash high | GLM high | GLM max |
| `substantial_reasoning` | Flash max | GLM high | GLM max | GLM max |
| `hardest_reasoning` | GLM high | GLM max | GLM max | GLM max |
| `hard_implementation` | Flash high | Flash max | GLM high | GLM max |
| `verification` | Flash high | Flash high | Flash max | Flash max |
| `unclassified` | Flash high | Flash high | GLM high | GLM high |

Flash supports image input; GLM-5.3 is text-only. Keep visual evidence collection on Flash or another explicitly configured vision-capable model.

Model IDs: Flash = `glm-5.3-flash`, GLM = `glm-5.3`. Keep thinking enabled. Native effort is high or max in this profile, with no implicit medium/xhigh mapping. No model fallback is bundled; retain a vision-capable model for assignments requiring images.
