# Incident & Postmortem Context

Not a separate source, a **cross-cutting angle**. Incidents often motivate defensive code ("we added this check after the X outage"), so if the target looks defensive (null checks, retry logic, timeout handling, rate limiting, feature flags), specifically hunt for incident history across every available source:

- **Issue tracker**: look for tickets labeled `incident`, `sev-*`, `postmortem-action-item`, or `reliability`
- **Team chat**: search incident channels around the dates the target code was added
- **Git**: commits with messages like "fix for incident", "add defensive check", or "revert" followed by "re-apply with..." are strong signals

If you find an incident link, fetch the full postmortem. Postmortems typically have an "Action Items" section that ties directly to code changes. When several sources corroborate each other (an incident ID appears in a ticket, which appears in a postmortem, which appears in a chat thread that links to the target PR), the evidence is especially strong.
