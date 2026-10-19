# Bundled skills and playbooks cannot be overridden locally

A project or user cannot replace one of polaris's own skills or playbooks with a local copy. A lesson about a bundled skill or playbook becomes a line in an instruction file that names the skill and what to do differently, or an upstream proposal when every user would hit it. The user's own project and user skills are unaffected.

## Considered options

- **Full-copy overrides** in `.agents/polaris/skills/<name>/`, which polaris supported before this decision. Rejected because they added work to every skill. Each bundled `SKILL.md` needed a line telling the agent to look for an override, enforced by `scripts/check_plugin.py`. Every skill call, playbook step, and subagent brief had to check which copy to follow. Overrides also needed relative paths that fell back to the bundled directory, version stamps to warn about stale copies, and a rule for malformed overrides. An override also stops receiving plugin updates as soon as it is copied.
- **Same-name local playbooks that replace bundled ones.** Rejected for the same reason: a copied playbook goes stale, and an instruction-file line records the same lesson.
