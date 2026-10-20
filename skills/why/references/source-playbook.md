# Source playbook

Use the sections for the sources the investigation needs, adapted to the available tools. For delegated searches, give each investigator only its assigned sections. Source control has its own playbook in `./sources/code-archaeology.md`.

Add the cross-cutting `./sources/incident-postmortem.md` when the target code looks defensive: null checks, retries, timeouts, rate limits, feature flags, egress guards, or out-of-memory handlers.

## Issue or ticket tracker

Examples: Linear, Jira, GitHub Issues, Plane, Shortcut.

- **Search:** ticket IDs from commit messages and PR bodies first, then the target's feature name, file name, and error strings. Read the whole ticket, including comments, subtasks, and linked tickets.
- **Good evidence:** a stated product or business requirement, a customer report, or an acceptance criterion that the code implements.
- **Pitfalls:** scope changed after a ticket was reopened; "Why" sections filled with boilerplate; stale tickets that describe a plan that later changed; duplicate chains (follow them to the canonical ticket); private tickets (report them as a gap).

## Long-form documents

Examples: Notion, Confluence, Google Docs, Coda.

- **Search:** links from PRs and tickets first, then design docs, RFCs, and specs that mention the feature or subsystem.
- **Good evidence:** a design doc that weighs alternatives and names the chosen one, with a date before the code shipped.
- **Pitfalls:** specs written before implementation and never updated; a doc that says X while the code does Y (flag the divergence); several drafts (use the finalized or most recent one); restricted pages (report them as a gap).

## Real-time team chat

Examples: Slack, Discord, Microsoft Teams, Mattermost.

- **Search:** links to the PR or ticket, then the feature name and error strings in team and incident channels, around the dates the code was added. Always read the whole thread.
- **Good evidence:** a considered discussion that ends in a decision, by people who then wrote or reviewed the code.
- **Pitfalls:** retention limits (name the date before which nothing is found); unsearchable direct messages; jokes or offhand remarks read as decisions; single messages read without their thread; an unauthenticated server (report that chat was not searchable, never invent findings).

## Infrastructure observability

Examples: Datadog, New Relic, Honeycomb, Grafana, Splunk.

- **Search:** monitors, alerts, and dashboards for the service and the metric that the code reacts to; incidents and logs around the ship date.
- **Good evidence:** a monitor or incident on the exact condition the code handles, such as a timeout rate or a rate limit, dated before the change.
- **Pitfalls:** correlation in time is not causation (check other changes in the same window); a chart shows what someone cared about, not why a specific line exists.

## Error or exception tracking

Examples: Sentry, Rollbar, Bugsnag, Airbrake.

- **Search:** issues whose stack traces pass through the target, and whose first-seen and last-seen dates bracket the target's ship date.
- **Good evidence:** an error that stops after the release that contains the target's commit, with a stack trace through the target.
- **Pitfalls:** errors regrouped under a new issue after a refactor; a release contains many commits, so the stop does not prove which one fixed it; errors that stopped because something upstream changed.

## Product analytics warehouse

Examples: Databricks, Snowflake, BigQuery, ClickHouse, dbt, Redshift.

- **Search:** list the available tables before you assume names. Look for feature-usage events, experiment and feature-flag exposure tables, and pipeline lineage that feeds the target.
- **Good evidence:** an experiment result or usage number that a PR or doc cites as the reason for the change.
- **Pitfalls:** an event that exists only shows that someone logged it; a step change in volume may be new instrumentation, not new behavior; notebooks are often not queryable (report them as a gap).
