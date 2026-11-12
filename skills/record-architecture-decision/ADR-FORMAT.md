# Decision record format

Use one Markdown file for each decision. Name the file `YYYY-MM-DD-short-decision-title.md`. Date-based names give records a stable chronological order without allocating sequential numbers across contributors.

## Lifecycle metadata

Start each record with YAML frontmatter:

```yaml
---
status: proposed
created: YYYY-MM-DD
---
```

Use one of four statuses:

- `proposed`: the choice is under consideration.
- `accepted`: the choice governs current work.
- `rejected`: the proposal was declined and its rationale is worth preserving.
- `superseded`: another record replaces this choice.

A replacement record links its predecessor:

```yaml
supersedes: 2025-06-12-cache-results-in-the-request.md
```

A superseded record links its replacement:

```yaml
status: superseded
superseded_by: 2026-11-07-store-results-with-the-work-item.md
```

Use the linked record's filename without its directory when both records share a directory. Otherwise, give the path relative to `docs/decisions/`. Keep exactly one `superseded_by` link. A list of `supersedes` links is valid when one new decision replaces several.

## Body

Use a title that names the decision:

```markdown
# {Short title naming the decision}

## Context

{Describe the problem, observed conditions, requirements, and constraints that shape the choice. Distinguish evidence from assumptions.}

## Decision

{State the chosen approach and its scope directly. A proposed or rejected record describes that proposal rather than an agreed choice.}

## Rationale

{Explain why the choice fits. Describe plausible alternatives and the reasons for rejecting them.}

## Consequences

{State the resulting obligations, tradeoffs, compatibility limits, and conditions that would justify another decision.}

## Evidence

{Link supporting requirements, measurements, reviews, or code when they help assess the choice.}
```

A short record can answer Context, Decision, Rationale, and Consequences in ordinary prose without these headings. Add the headings when they help the reader assess a complex or consequential choice. Include Evidence only when there is evidence worth linking.

Do not add empty sections or repeat the filename in a `title` field. Current behavior belongs in code and current architecture documentation. The record preserves why this choice was made under the stated conditions.
