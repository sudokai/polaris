---
status: accepted
created: 2026-11-09
---

# Only cheap skills that work without the router start automatically

An agent may start a bundled skill on its own only when the skill is useful without the router, changes nothing outside the task's own output, starts subagents only to read in bulk, and is wanted in sessions that did not start with `/polaris`. Every other skill except the router is hidden from automatic selection, and runs through its command or through the router.

Hiding every skill would stop global instructions from using these capabilities. Exposing every skill would add each description to every session's context, and would let costly or broad work start without the router.

Each skill's frontmatter owns its setting: `disable-model-invocation: true` hides it. `scripts/check_plugin.py` checks that Codex's `agents/openai.yaml` agrees. No separate list of skills is kept, because a list repeats what the skill folders already say and goes stale. A missed automatic trigger belongs in the skill's description. A missed router trigger belongs in the router.
