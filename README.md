# polaris

polaris is an agent plugin that guides coding agents through a codebase and through a workflow. Its router skill, `polaris`, matches each task to a playbook or a skill, and names the engineering principles that govern each decision. Its skills help agents understand code, settle designs, prove behavior on the real app, and hand work back to the user.

## What's inside

- **Router:** `skills/polaris/`. It names the skill, playbook, or principle for the situations an agent runs into during a task.
- **Playbooks:** `skills/polaris/playbooks/`. The router's Playbooks section says when each one applies. Playbooks own the sequence and delivery; skills own each capability's method and output; principles guide decisions.
- **Principles:** `skills/engineering-principles/`. Its `SKILL.md` indexes the principles by the situation each one governs; run the `engineering-principles` skill to apply the ones that fit the current task.
- **Skills:** one folder per skill in `skills/`. Each `SKILL.md` description says what the skill does and when to use it.

## Use

Start a task with `/polaris` (in pi, `/skill:polaris`; in Amp, ask for the `polaris:polaris` skill), followed by what you want.

The router sends each task to the skills it needs. Before substantial work, it has the agent build a harness to check the result and a playbook for the task, and run the playbook as [the playbook rules](skills/polaris/playbooks/README.md) describe. A design-only request returns a design; it does not start implementation.

Skills without `disable-model-invocation: true` in their frontmatter also start on their own when they fit, without `/polaris`. [Agent-invocable skills](docs/decisions/2026-11-09-agent-invocable-skills.md) explains which skills qualify.

## Local files

polaris keeps project playbooks and resume notes in `.agents/polaris/`, and user playbooks in `~/.agents/polaris/playbooks/`. A project playbook replaces a user playbook with the same file name. Local playbooks add to the bundled ones and never replace them. Approved session lessons go into local playbooks or local copies of installed skills, never into the plugin cache.

## Documentation

[polaris documentation](docs/README.md) indexes the decision records and the open work.

## Develop

Run the structural check before you commit:

```bash
python3 scripts/check_plugin.py
python3 -m unittest discover -s scripts -p '*_test.py'
```

The structural check covers skill frontmatter, invocation settings, links, router and principle indexes, bundled agents, and harness-specific terms. It rejects counts and lists of skills outside the router and the principles index, because the skill folders are the only inventory. It also rejects links that leave a skill's folder, stale generated copies, and names of skills that do not exist. Some skills carry a generated copy of another skill's file, listed in `GENERATED_COPIES` in `scripts/check_plugin.py`. Edit the source, then run `python3 scripts/sync_generated_copies.py`. The tests run each check on small sample trees, without tying validation to prose wording. In Claude Code, `claude plugin validate .` also checks the manifest.

## License

MIT. polaris is derived from [pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan, which is also MIT-licensed. See `LICENSE`.
