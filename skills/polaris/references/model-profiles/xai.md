# xAI budget profile

Read only for the selected `xai` profile. Apply configuration and fallback rules from [model selection](../models.md). These are allocation policies, not measured equivalence or savings claims.

The general xAI profile combines Composer 2.5 for bounded execution with Grok 4.7 for reasoning and difficult implementation. Use this profile in Cursor, Grok Build, and other harnesses when the configured route supports both models. Provider profiles are independent of harness defaults.

Composer means Composer 2.5 with no prescribed reasoning effort. In Cursor, explicitly select the standard tier with `composer-2.5[fast=false]`. Hermes's xAI catalogue includes `grok-composer-2.5-fast` as an OAuth-only model omitted from ordinary model listings. Do not assume that this route supports Cursor's standard tier, pricing, or speed controls. Resolve the exact ID, access requirements, and tier in the target harness.

| Work | Small | Medium—default | Large | Unlimited |
| --- | --- | --- | --- | --- |
| `ordinary` | Composer | Composer | Grok medium | Grok high |
| `bounded_judgment` | Grok low | Grok medium | Grok high | Grok xhigh |
| `substantial_reasoning` | Grok medium | Grok high | Grok xhigh | Grok xhigh |
| `hardest_reasoning` | Grok high | Grok xhigh | Grok xhigh | Grok xhigh |
| `hard_implementation` | Composer | Grok high | Grok xhigh | Grok xhigh |
| `verification` | Composer | Composer | Grok high | Grok xhigh |
| `unclassified` | Grok low | Grok medium | Grok high | Grok high |

Composer execution does not require a separate Grok review after every assignment. Use independent review when the task's uncertainty and risk justify it.

Hermes can expose these models, but its current delegation configuration selects one shared model and effort rather than a pair per assignment. Catalogue availability alone does not establish that a harness can apply the full profile to its subagents.

### Grok-only fallback

When setup confirms Composer is unavailable and the user selects Grok-only operation, save the allocations here as explicit overrides. A later Composer rejection uses the runtime fallback below rather than implicitly selecting this table. All cells use Grok 4.7. Its supported effort levels are low, medium, high, and xhigh. Do not use `grok-4.7-build-fast` as an economy model: the installed model catalogue identifies it as a faster variant at twice the price.

| Work | Small | Medium—default | Large | Unlimited |
| --- | --- | --- | --- | --- |
| `ordinary` | Low | Low | Medium | High |
| `bounded_judgment` | Low | Medium | High | Xhigh |
| `substantial_reasoning` | Medium | High | Xhigh | Xhigh |
| `hardest_reasoning` | High | Xhigh | Xhigh | Xhigh |
| `hard_implementation` | High | Xhigh | Xhigh | Xhigh |
| `verification` | Medium | High | Xhigh | Xhigh |
| `unclassified` | Low | Medium | High | High |

Model IDs: Grok = `grok-4.7`; Composer IDs and tiers depend on the connection. With Composer available, its default runtime fallback is Grok low. If setup cannot provide Composer, resolve and save the Grok-only column as explicit category overrides so its higher verification and implementation allocations are unambiguous. User-specified fallback lists take precedence. Do not silently alternate between the two policies at runtime.
