# GLM budget profile

Read only for the selected `glm` profile. Apply configuration and fallback rules from [model selection](../models.md). These are allocation policies, not measured equivalence or savings claims.

Flash means GLM-5.3-Flash; GLM means GLM-5.3. Use no low-effort allocations. Flash handles regular execution and scoped reasoning, with GLM allocated to deeper reasoning and the most demanding implementation.

Both models support low, high, and max thinking effort. Use the explicit high/max allocations here. Max remains eligible because neither model offers a distinct xhigh level.

| Kind | Level | Small | Medium—default | Large | Unlimited |
| --- | --- | --- | --- | --- | --- |
| `execution` | `regular` | Flash high | Flash high | Flash max | Flash max |
| `execution` | `complex` | Flash high | Flash high | GLM high | GLM high |
| `reasoning` | `scoped` | Flash high | Flash high | GLM high | GLM max |
| `reasoning` | `hard` | Flash max | GLM high | GLM max | GLM max |
| `reasoning` | `very_hard` | GLM high | GLM max | GLM max | GLM max |

| Fallback | Small | Medium—default | Large | Unlimited |
| --- | --- | --- | --- | --- |
| `unclassified` | Flash high | Flash high | GLM high | GLM high |

Flash supports image input; GLM-5.3 is text-only. For assignments requiring images, use Flash or another explicitly configured vision-capable model. If the selected allocation is text-only, resolve a suitable override or fallback before proceeding.

Model IDs: Flash = `glm-5.3-flash`, GLM = `glm-5.3`. Keep thinking enabled. Native effort is high or max in this profile, with no implicit medium/xhigh mapping. No model fallback is bundled; retain a vision-capable model for assignments requiring images.
