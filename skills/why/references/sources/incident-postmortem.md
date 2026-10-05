# Incident & Postmortem Context

Not a separate source, a **cross-cutting angle**. Incidents often motivate defensive code ("we added this check after the X outage"), so if the target looks defensive (null checks, retry logic, timeout handling, rate limiting, feature flags), specifically hunt for incident history across every available source:

- **Long-form documents**: search for postmortems that mention the target file, feature, or error string
- **Issue tracker**: look for tickets labeled `incident`, `sev-*`, `postmortem-action-item`, or `reliability`
- **Team chat**: search incident channels around the dates the target code was added
- **Git**: commits with messages like "fix for incident", "add defensive check", or "revert" followed by "re-apply with..." are strong signals
- **Infrastructure observability**: formal incident records with timelines, and dashboards or monitors created as postmortem action items
- **Error tracking**: issues whose first-seen and last-seen window aligns with the target's ship date, with stack traces through the target
- **Product analytics**: events that classify an error condition often spike during an incident window. A drop after the target ships is circumstantial support that the target resolved the user-visible symptom.

If you find an incident link, fetch the full postmortem. Postmortems typically have an "Action Items" section that ties directly to code changes. When several sources corroborate each other (an incident ID appears in a ticket, which appears in a postmortem, which appears in a chat thread that links to the target PR), the evidence is especially strong.

Worth spending time on when the code's defensive character makes an incident-driven origin plausible. Skip it for code that doesn't look defensive.
