# polaris

polaris is an agent plugin that guides coding agents through a codebase and through a workflow. Its router skill, `polaris`, matches each task to a playbook or a skill, and names the engineering principles that govern each decision. Its skills focus on mapping code before changing it, designing architecture that agents can extend safely, proving behavior on the real app, and learning from past sessions.

## What's inside

- **Router:** `skills/polaris/`, with 24 principles in `principles/`, playbooks in `playbooks/`, the model role table in `references/models.md`, and per-harness facts in `references/harnesses.md`.
- **Mapping:** `how`, `why`, and `blast-radius`.
- **Verification:** `create-verification-skill`, `maintain-verification-skill`, and `prove-it`.
- **Design and correction:** `architect` and `correct`.
- **Large work:** `figure-it-out` and `show-me-your-work`.
- **Learning from history:** `reflect` and `recall`.
- **Setup:** `setup-polaris`.

## Install

The plugin follows the [Agent Plugins](https://agent-plugins.org/) format (`plugin.json` and `skills/`), plus a small manifest for each harness that needs one.

- **Claude Code:** the repository is its own marketplace. Run `claude plugin marketplace add <path-to-polaris>`, then `claude plugin install polaris@polaris`. To try it for one session, run `claude --plugin-dir <path-to-polaris>`. The manifest is `.claude-plugin/plugin.json`, which also lists the role agents in `com.anthropic.claude-code/agents/`.
- **Codex:** the repository is its own marketplace (`.agents/plugins/marketplace.json`). Run `codex plugin marketplace add <path-to-polaris>`, then `codex plugin add polaris@polaris`. The manifest is `.codex-plugin/plugin.json`.
- **Grok Build:** run `grok plugin install <path-to-polaris> --trust`. Role agents are in `agents/`. Grok copies the plugin at install time. To pick up later edits, run `grok plugin uninstall polaris --confirm`, install it again, and start a new session.
- **Cursor:** install it as a plugin. The manifest is `.cursor-plugin/plugin.json`.
- **pi:** run `pi install <path-to-polaris>`. pi reads `package.json`.
- **Hermes:** run `hermes plugins install <git URL or file://path>`, then `hermes plugins enable polaris`. Hermes reads `plugin.json`.
- **DeepSeek Harness (`dsh`):** run `dsh plugin --profile <profile> add <path-to-polaris>` for each profile. dsh reads `package.json` and `cordis.patch.yml`.

To install or refresh it in every harness on your machine, run the repository's `install-polaris` skill from a session in this repository.

## Use

Start a task with `/polaris` (in pi, `/skill:polaris`), followed by what you want.

To change which models the roles use, run `/setup-polaris`.

## Local files

polaris keeps its local files in `.agents/polaris/` in a project and in `~/.agents/polaris/` for every project: model overrides, local playbooks, the deferred-fix backlog, and resume notes. A project file wins over a user file. Local playbooks add to the bundled ones and never replace them. `reflect` records lessons there and in instruction files instead of editing the plugin. `skills/polaris/references/locations.md` is the full contract.

## Develop

Run the structural check before you commit:

```bash
python3 scripts/check_plugin.py
```

It checks skill frontmatter, link targets, the router's indexes, and that no harness-specific terms appear outside the files meant to hold them. In Claude Code, `claude plugin validate .` also checks the manifest.

## License

MIT. polaris is derived from [pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan, which is also MIT-licensed. See `LICENSE`.
