---
name: why
description: "Find why existing code has its current design: decisions, requirements, incidents, or thresholds. Follow code history and linked records, and separate evidence from inference and unknowns."
---

# Why

Find the historical reasons for existing code without inventing intent. Investigation is read-only. Code and current tests establish what the system does, not why the author chose it.

## Step 1. Define the target and question

Identify the code, boundary, threshold, or behavior under investigation and the question to answer. If the target is ambiguous, state a reasonable interpretation from the available context and proceed with that interpretation.

Treat an explanation suggested by the user as a hypothesis to check, not as an answer to confirm.

## Step 2. Establish the code anchor

Record the relevant paths, symbols, and line ranges. Reuse evidence already collected for this task.

Use [code history commands](references/sources/code-archaeology.md) to locate the change that introduced the decision. The latest commit on a line may be only a rename, a reformat, or a partial fix. Read the relevant patch and commit message, nearby comments, tests changed at the same time, and available decision records.

Read relevant PRs and review discussions in full, including comments and review threads. Preserve exact locations for each finding.

## Step 3. Follow the evidence

Follow links from commits to PRs, tickets, design documents, discussions, and incidents. Read the material that bears on the question.

When a material gap or disagreement remains, search the available source most likely to resolve it. Use the [source playbook](references/source-playbook.md) for issue trackers, design documents, team discussions, observability, error tracking, and product analytics. Search [incident and postmortem evidence](references/sources/incident-postmortem.md) when defensive code suggests that a failure motivated it.

Continue while a promising source could materially change the answer. Otherwise stop and report the remaining uncertainty. For a comprehensive investigation, check each available and relevant source category. Record unavailable sources and unnecessary categories separately. Do not treat either one as an empty search.

Delegate a source search only when it needs a lot of reading or when running it alongside other searches saves time. Give each read-only investigator the question, code anchor, assigned section of the source playbook, and completed searches. Ask for citations, contradictions, and search gaps.

## Step 4. Weigh and report the evidence

Follow the [evidence rules](references/epistemics.md):

- Cite the source beside each factual claim about motivation.
- Distinguish an explicit statement, converging indirect evidence, and your interpretation.
- Report conflicting records rather than choosing the most convenient explanation.
- Describe meaningful searches that returned nothing and sources you could not access.
- Say **unknown** when the available records do not answer the question.

If a consequential action depends on resolving contradictory or uncertain evidence, and reporting the disagreement is not enough, ask a reviewer who has not seen your explanation to inspect the same sources. Check the review against those sources and report its limits.

Answer the original question first. For a narrow question, concise prose may suffice. Separate findings, interpretations, and unknowns whenever they could otherwise be mistaken for one another.

When the findings inform a code change, identify affected constraints, past incidents, and previously failed approaches. Explain what the current implementation must still account for. Historical rationale alone does not establish whether a requirement remains valid or an earlier approach remains unsuitable.
