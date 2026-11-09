# Incident and postmortem evidence

Defensive code such as retries, timeouts, rate limits, and egress guards may follow an operational failure. Check that possibility when relevant records suggest an incident.

- Search issue trackers for incident, severity, reliability, or postmortem labels.
- Search incident discussions near the change's implementation date.
- Inspect commits describing an incident, a revert, or a corrected reapplication.
- Read the relevant postmortem and action items rather than assuming what they say.

Connect the incident to the target through dates, symptoms, affected components, and explicit links. Shared identifiers show that records belong to the same investigation; they do not alone establish which code fixed the problem. Distinguish the observed failure, the stated cause, and the preventive action that the team selected.
