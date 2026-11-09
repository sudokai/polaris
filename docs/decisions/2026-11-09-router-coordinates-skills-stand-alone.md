---
status: accepted
created: 2026-11-09
---

# The router coordinates, and every other skill stands alone

## Context

polaris bundles a router, a library of engineering principles, and skills that each do one job. Skills reused each other by linking into each other's folders, and by sharing files whose fields and states were split between the skill that wrote them and the skill that read them. A skill folder copied out of the plugin, as `self-improve` does to change an installed skill, lost those links. Inlining the other skill's method instead would replace a maintained method with a weaker imitation.

## Decision

- `polaris` coordinates: it routes, owns the playbooks, and decides the order in which skills run. It may link into any bundled skill.
- `engineering-principles` holds the principle files and their one index.
- Every other skill works when its folder is copied out on its own. It links only to files inside its folder.
- A skill that wants another skill's result names that skill and states the result it needs in the same sentence. An agent without the named skill still knows what to produce.
- A skill that needs another skill's know-how inside one of its own steps carries a generated copy. Only the source is edited. `scripts/sync_generated_copies.py` writes the copies listed in `GENERATED_COPIES` in `scripts/check_plugin.py`.
- A file that outlives a session has one owner that defines its fields and states, such as the resume note in the router's playbooks and the coverage record in `formal-verification-skill`.
- Skills share one method across harnesses. Harness-specific packaging lives in manifests.

## Rationale

Naming a skill keeps reuse inside the plugin, and falls back to a stated goal outside it. A generated copy costs the same to read as a link, survives being copied out, and cannot drift, because the validator reports a stale copy. Keeping the order of skills in the router stops skills from depending on each other's steps.

Two alternatives were rejected. A shared skill of runtime facts, reached by path, breaks when a folder is copied out. Inlining forks a good method into copies that are edited separately.

## Consequences

`scripts/check_plugin.py` checks for links that leave a skill's folder outside the router, for stale or missing generated copies, and for names of skills that do not exist. A new dependency between two skills is either a named result or a generated copy. Revisit this if harnesses gain a way to declare dependencies between skills that survives copying a skill out.
