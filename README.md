# polaris

polaris is an agent plugin that guides coding agents through a codebase and through a workflow. Its router skill, `polaris`, matches each task to a playbook or a skill, and names the engineering principles that govern each decision. Its skills focus on mapping code before changing it, designing architecture that agents can extend safely, proving behavior on the real app, and learning from past sessions.

## What's inside

- **Router:** `skills/polaris/`, with playbooks in `playbooks/`, [model budgets](skills/polaris/references/models.md), and [per-harness facts](skills/polaris/references/harnesses.md).
- **Playbooks:** feature development, bug fixes, refactoring, verification setup, session pickup, and safe pauses. Playbooks own the sequence and delivery; skills own each capability's method and output; principles guide decisions.
- **Principles:** 24 hidden skills named `principle-<slug>`, such as `principle-prove-it-works`. Run the skill to apply that rule. The router indexes the same skills.
- **Mapping:** `how`, `why`, `walkthrough`, and `blast-radius`.
- **Verification:** `create-verification-skill`, `maintain-verification-skill`, `create-formal-verification-skill`, `maintain-formal-verification-skill`, `statechart`, and `prove-it`.
- **Debugging and tests:** `diagnose`, `tdd`, and `no-change-detector-tests`.
- **Design and correction:** `discuss`, `sharpen-domain-language`, `model-domain`, `record-architecture-decision`, `architect`, `finalize-plan`, `prototype`, `show-me`, `lantern`, and `correct`.
- **Technical prose:** `technical-writing` for document structure and style, and `deslop-language` for removing AI writing patterns.
- **Writing and finishing code:** `write-discoverable-code`, `deslop`, `sweep-residue`, and `visual-pr`.
- **Task-specific playbooks and decisions:** `figure-it-out` designs a playbook when none fits; `decision-log` records decisions during execution.
- **Learning from history:** `reflect` and `recall`.
- **Conversation:** `ketchup`, `restate-my-intent`, `sharpen`, and `say-it-plainly`.
- **Setup and help:** `setup-polaris` and `polaris-help`.

## Install

The plugin follows the [Agent Plugins](https://agent-plugins.org/) format (`plugin.json` and `skills/`), plus a small manifest for each harness that needs one.

- **Claude Code:** the repository is its own marketplace. Run `claude plugin marketplace add <path-to-polaris>`, then `claude plugin install polaris@polaris`. To try it for one session, run `claude --plugin-dir <path-to-polaris>`. The manifest is `.claude-plugin/plugin.json`, which also lists the model-pair agents in `com.anthropic.claude-code/agents/`. Claude Code leaves auto-update off for third-party marketplaces, so polaris stays on the version you installed. To turn it on, run `/plugin`, open the **Marketplaces** tab, select `polaris`, and choose **Enable auto-update**. To update once by hand, run `claude plugin update polaris@polaris`.
- **Codex:** the repository is its own marketplace (`.agents/plugins/marketplace.json`). Run `codex plugin marketplace add <path-to-polaris>`, then `codex plugin add polaris@polaris`. The manifest is `.codex-plugin/plugin.json`.
- **Grok Build:** run `grok plugin install <path-to-polaris> --trust`. Model-pair agents are in `agents/`. Grok copies the plugin at install time. To pick up later edits, run `grok plugin uninstall polaris --confirm`, install it again, and start a new session.
- **Cursor:** install it as a plugin. The manifest is `.cursor-plugin/plugin.json`.
- **pi:** run `pi install <path-to-polaris>`. pi reads `package.json`.
- **Hermes:** add `<path-to-polaris>/skills` to `skills.external_dirs` in `~/.hermes/config.yaml`, then start a new session. Do not run `hermes plugins install`. That command prefixes every skill command with `agent-plugin-polaris-<hash>:`. If polaris is already installed that way, run `hermes plugins remove polaris`.
- **DeepSeek Harness (`dsh`):** run `dsh plugin --profile <profile> add <path-to-polaris>` for each profile. dsh reads `package.json` and `cordis.patch.yml`.

To install or refresh it in every harness on your machine, run the repository's `install-polaris` skill from a session in this repository.

## Use

Start a task with `/polaris` (in pi, `/skill:polaris`), followed by what you want.

For implementation, the router selects the feature-development, bug-fix, or refactor playbook. Steps reuse prior findings and valid evidence, and call only the skills the task needs. A design-only request returns a design; it does not start implementation. `figure-it-out` creates a task-specific playbook when existing ones do not fit. The shared execution and completion rules live in [playbook execution rules](skills/polaris/playbooks/README.md).

Run `/setup-polaris` to select a provider profile, a budget (medium by default), and optional fixed kind/level overrides. Assignments have a kind (`reasoning` or `execution`) and a level within that kind. Profiles select model–effort pairs for those assignments; they do not change the main conversation's model. Project configuration is saved in `.agents/polaris/models.yaml`. User configuration goes in the current harness's config directory, such as `~/.codex/polaris/models.yaml`. Hermes retains its existing delegation settings. For help with polaris itself, run `/polaris-help` with a question.

Nineteen skills also start on their own when they fit, without `/polaris`: `prove-it`, `diagnose`, `no-change-detector-tests`, `decision-log`, `prototype`, `restate-my-intent`, `ketchup`, `discuss`, `sharpen-domain-language`, `model-domain`, `record-architecture-decision`, `tdd`, `write-discoverable-code`, `deslop`, `sweep-residue`, `walkthrough`, `lantern`, `technical-writing`, and `deslop-language`.

## Local files

polaris keeps project model settings, local playbooks, the deferred-fix backlog, and resume notes in `.agents/polaris/`. User model settings live in each harness's config directory; user playbooks live in `~/.agents/polaris/playbooks/`. A project setting wins over a user setting. Local playbooks add to the bundled ones and never replace them. `reflect` records lessons there and in instruction files instead of editing the plugin. [Locations](skills/polaris/references/locations.md) is the full contract.

## Documentation

[Glossary](GLOSSARY.md) defines the terms polaris uses. [polaris documentation](docs/README.md) indexes the decision records and the open work.

## Develop

Run the structural check before you commit:

```bash
python3 scripts/check_plugin.py
python3 -m unittest discover -s scripts -p '*_test.py'
```

The structural check covers skill frontmatter, links, router indexes, complete profile tables, agent registrations, and harness-specific terms. The tests exercise invalid allocations and undiscoverable agents without tying validation to prose wording. In Claude Code, `claude plugin validate .` also checks the manifest.

## License

MIT. polaris is derived from [pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan, which is also MIT-licensed. See `LICENSE`.
