---
name: why
description: "Investigate why code is shaped this way: design rationale, regressions, postmortems, or data-backed thresholds. Follow history and linked evidence, expand for gaps or contradictions, and return cited findings with explicit search coverage. Use how for runtime behavior."
disable-model-invocation: true
---

# Why

Investigate the motivation and intent behind code. The companion `how` skill (`../how/SKILL.md`) answers what the code does and how it works. `why` answers what forces led to its shape.

Work directly when the investigation is small. Delegate independent searches or bulk reading as `kind: execution`, `level: regular` assignments, chosen with `../polaris/references/models.md`. Give investigators access to the MCP servers they need. All investigation is read-only.

## Operating Posture

Operate as a **careful, cautious, and precise investigator**. Be honest about what you know vs what you're inferring. Read `references/epistemics.md` for the full confidence framework and phrasing guide. Apply it whether you synthesize yourself or delegate.

## Step 1. Understand the Target and the Question

The **target** is usually a chunk of code, a pattern, a feature, or a named design decision. The **question** is usually a design rationale, a tradeoff, a motivating edge case, an external constraint, dead code, or a broad history sweep.

If the target is vague ("why do we do it this way?" with no clear referent), make your best guess from conversation context (open files, recent edits, what was just discussed). State your interpretation briefly so the user can redirect if you're off, then proceed.

## Step 2. Establish the Code Anchor

Build the seed context inline: target paths and line ranges, key symbols, relevant commits, PR numbers, and linked ticket IDs. Reuse evidence already gathered for this task. Start with targeted `git blame -L <start>,<end> <file>` and `git log --oneline -20 -- <file>`. Read the relevant commit messages and patches; use `git log --follow` or pickaxe searches when earlier history matters. Pull relevant PR bodies and discussion with `gh pr view <number> --json title,body,author,createdAt,mergedAt,labels,closingIssuesReferences,comments,reviews`. Share this anchor and the searches already completed with any investigators.

## Step 3. Follow the Evidence

Start with the code anchor and linked evidence: a commit's PR, the PR's ticket, the ticket's design document or chat thread. Read the discussion that bears on the question, not just titles. A source need not be linked to be worth searching: a missing rationale, conflicting accounts, unexplained defensive code, or a data-backed threshold calls for a targeted search in the category most likely to answer it.

Expand until the question is supported by evidence or the relevant leads are exhausted. Do not treat a plausible explanation as proof. Stop when the answer is supported and no material contradiction or lead remains; report remaining unknowns and unsearched categories. If the user requests a comprehensive investigation, search every available category unless it is demonstrably irrelevant, and record any skip.

### Discovery

Identify available sources from the session's tools and server instructions. Map them to the evidence categories below, using git and `gh` where available for source control. Classify MCPs by their primary evidence and note ambiguous cases in the coverage map.

Search inline when the trail is short. For parallel searches or bulk reading, assign bounded questions to investigators for `kind: execution`, `level: regular` source exploration, with non-overlapping source ownership. One investigator may follow a short trail across several categories; do not create an agent merely because another MCP is available. Keep already-read items and cross-source leads with the coordinator so agents do not repeat searches.

For each delegated search, use `references/investigator-prompt.md`, plus:
- the category guidance for the selected MCP server, adapted from `references/source-playbook.md`. For source control, also `references/sources/code-archaeology.md`
- `references/sources/incident-postmortem.md` **if the target code looks defensive** (null checks, retry logic, timeout handling, rate limiting, feature flags, egress guards, OOM handlers)
- the code anchor and the user's original question

### Evidence categories

Use each category's strengths to choose the next search and to describe gaps.

1. **Source control** (git history, `gh` for PRs, code comments, tests). Always inspect available history; report missing history or inaccessible PRs as gaps. Best at *implementation-time rationale captured during review*.
2. **Issue / ticket tracker** (e.g. Linear, Jira, GitHub Issues, Plane, Shortcut MCP). Best at *the product or business forcing function*. Strongest when the why is external to engineering.
3. **Long-form documents** (e.g. Notion, Confluence, Google Docs, Coda MCP). Best at *long-form design rationale*, written out before it becomes code.
4. **Real-time team chat** (e.g. Slack, Discord, Microsoft Teams, Mattermost MCP). Best at *real-time deliberation that never reached a doc*. Especially important when the source control, ticket, and doc paper trail is thin.
5. **Infrastructure observability** (e.g. Datadog, New Relic, Honeycomb, Grafana, Splunk MCP). Best at *infrastructure and runtime reality that motivated the code*. Strongest when the target reacts to an infra signal (timeouts, retries, rate limits, circuit breakers).
6. **Error / exception tracking** (e.g. Sentry, Rollbar, Bugsnag, Airbrake MCP). Best at *the specific exceptions and error trajectories that motivated defensive or corrective code*. Strongest for catch blocks, null guards, type checks, retries, and other defenses.
7. **Product analytics warehouse** (e.g. Databricks, Snowflake, BigQuery, ClickHouse, dbt, Redshift MCP). Best at *product and data reality that shaped the code*. Strongest for flag-gated code, experiment-driven ships, data migrations, and "where did this number come from" questions.

### Coverage and stopping

Account for every category in Sources Consulted using these states. Group categories with the same status and reason into one line:

- **Searched:** items or queries, useful findings or no results, and relevant limits on the search.
- **Unavailable:** missing tools, access, history, or retention. This is a gap, not a negative result.
- **Not searched:** why the current evidence did not warrant expanding here, or why the source is irrelevant. This does not mean the source contains no relevant evidence.

In a comprehensive investigation, only unavailability or demonstrated irrelevance justifies leaving a category unsearched. If evidence is incomplete, narrow the answer and its confidence rather than inventing a reason.

## Step 4. Synthesize

Synthesize the findings yourself using `references/synthesizer-prompt.md` and the epistemics framework. Reconcile overlaps and spot-check citations; keep facts, inference, and gaps separate.

For consequential conclusions (security, data loss, compatibility, difficult migrations, or costly architectural commitments), or when material accounts conflict, start one fresh reviewer, classified as `kind: reasoning` with `level: hard` or `level: very_hard` according to the unresolved reasoning difficulty. Consequences determine whether independent review is needed. Give it the question, code anchor, cited evidence, and coverage gaps without your preferred explanation. Ask it to challenge unsupported conclusions and alternative readings, not repeat the full search or start more agents. Then reconcile its findings against the sources; leave unresolved contradictions visible. If independent review is unavailable, report that limitation.

## Step 5. Present

Present the evidence and its confidence to the user. Do not strengthen confidence language beyond what the sources support.

## Output Format

Use `references/synthesizer-prompt.md`: The Question, The Code in Question, What We Found, What We Can Reasonably Infer, Competing Hypotheses, What We Don't Know, Sources Consulted, Confidence Summary. Keep narrow answers brief and omit empty sections, but preserve confidence separation and explicit coverage of unavailable and unsearched categories. Group coverage lines when their status and reason match.

After Sources Consulted, if the user's `why` question is a precursor to changing this code, convert the lineage findings into a Preserve / Change / Avoid / Risk constraint set for planning the change.

## Common Failure Modes to Avoid

- **Recency bias**. Assuming the most recent commit is authoritative. The current shape is often the accretion of many earlier decisions. Trace back.
