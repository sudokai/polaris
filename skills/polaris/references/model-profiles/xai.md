# xAI budget profile

Read only for the selected `xai` profile. Apply configuration and fallback rules from [model selection](../models.md). These are allocation policies, not measured equivalence or savings claims.

The general xAI profile combines Composer 2.5 for bounded execution with Grok 4.7 for reasoning and difficult implementation. Use this profile in Cursor, Grok Build, and other harnesses when the configured route supports both models. Provider profiles are independent of harness defaults.

Composer means Composer 2.5 with no prescribed reasoning effort. In Cursor, explicitly select the standard tier with `composer-2.5[fast=false]`. Hermes's xAI catalogue includes `grok-composer-2.5-fast` as an OAuth-only model omitted from ordinary model listings. Do not assume that this route supports Cursor's standard tier, pricing, or speed controls. Resolve the exact ID, access requirements, and tier in the target harness.

| Kind | Level | Small | Medium—default | Large | Unlimited |
| --- | --- | --- | --- | --- | --- |
| `execution` | `regular` | Composer | Composer | Grok medium | Grok high |
| `execution` | `complex` | Composer | Grok medium | Grok high | Grok high |
| `reasoning` | `scoped` | Grok low | Grok medium | Grok high | Grok xhigh |
| `reasoning` | `hard` | Grok medium | Grok high | Grok xhigh | Grok xhigh |
| `reasoning` | `very_hard` | Grok high | Grok xhigh | Grok xhigh | Grok xhigh |

| Fallback | Small | Medium—default | Large | Unlimited |
| --- | --- | --- | --- | --- |
| `unclassified` | Grok low | Grok medium | Grok high | Grok high |

Composer execution does not require a separate Grok review after every assignment. Use independent review when the task's uncertainty and risk justify it.

Hermes can expose these models, but its current delegation configuration selects one shared model and effort rather than a pair per assignment. Catalogue availability alone does not establish that a harness can apply the full profile to its subagents.

### Grok-only fallback

When setup confirms Composer is unavailable and the user selects Grok-only operation, save the allocations here as explicit overrides. A later Composer rejection uses the runtime fallback below rather than implicitly selecting this table. All cells use Grok 4.7. Its supported effort levels are low, medium, high, and xhigh. Do not use `grok-4.7-build-fast` as an economy model: the installed model catalogue identifies it as a faster variant at twice the price.

| Kind | Level | Small | Medium—default | Large | Unlimited |
| --- | --- | --- | --- | --- | --- |
| `execution` | `regular` | Low | Low | Medium | High |
| `execution` | `complex` | Medium | High | High | High |
| `reasoning` | `scoped` | Low | Medium | High | Xhigh |
| `reasoning` | `hard` | Medium | High | Xhigh | Xhigh |
| `reasoning` | `very_hard` | High | Xhigh | Xhigh | Xhigh |

| Fallback | Small | Medium—default | Large | Unlimited |
| --- | --- | --- | --- | --- |
| `unclassified` | Low | Medium | High | High |

Model IDs: Grok = `grok-4.7`; Composer IDs and tiers depend on the connection. With Composer available, its default runtime fallback is Grok low. If setup cannot provide Composer, resolve and save the Grok-only column as explicit kind/level overrides so the execution allocations are unambiguous. User-specified fallback lists take precedence. Do not silently alternate between the two policies at runtime.
