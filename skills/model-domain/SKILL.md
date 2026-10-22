---
name: model-domain
description: Understand and document an existing domain model. Use when clarifying domain relationships, ownership, lifecycles, or business rules, or maintaining domain documentation.
---

# Model domain

Read the implementation and write or update documentation that explains how the domain works.

This skill changes documentation only. Do not change application code, tests, or configuration, create prototypes, or implement proposed model changes. Report proposed changes separately.

## Understand the domain

Choose the reader and the question to answer. Read the relevant implementation, glossary, domain documentation, and verification feature map where available.

Use concrete scenarios and boundary cases to identify concepts, relationships, ownership, rules that must always hold, and allowed state transitions. Use `define-domain-language` for ambiguous terms.

Distinguish current behavior, intended rules, and proposed changes. Surface contradictions with evidence rather than inventing rules or silently choosing a source.

## Write the explanation

Use `technical-writing` to write an explanation. State its purpose, introduce the central concepts, and follow a concrete example through their relationships and rules.

Use `show-me` for the smallest useful diagram or table. Explain what it means. Include important boundary cases without cataloguing every policy and exception.

Improve the existing explanation first. Choose its scope and location by domain ownership and the reader's question, following repository conventions.

Keep a small, cohesive model in one document. Split topics when they can be understood and maintained independently. Add an overview only when it explains relationships across domains or helps readers find the relevant explanation. `DOMAIN.md` is an optional filename, not a required output.

Link definitions in the glossary, rationale in ADRs, and driving instructions in the feature map instead of copying them. Use `record-architecture-decision` for rationale worth preserving. Keep operational details and open work in their existing references.

## Check and finish

Check the example and key rules against their sources. Can a newcomer answer the opening question and follow the example without looking elsewhere for basic meaning?

Report contradictions, proposed changes, and unverified behavior separately from the current model. Do not present intended rules as implemented behavior.

Finish with `deslop-language` on the explanation and accompanying prose. Recheck meaning and accuracy after editing.
