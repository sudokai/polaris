# Generated model-pair definitions

polaris ships no model-pair agent files. `/setup-polaris` generates one definition per resolved pair for Claude Code, Grok Build, and Droid, from the [model profiles](../../skills/polaris/references/model-profiles/), which are the only record of each pair. Claude Code sessions whose Agent tool exposes `model` and `effort` need no definitions.

Bundled files kept a second copy of each pair. Every profile change then had to be repeated by hand in each harness's files, and the copies could drift from the profiles.

The model ID for a pair depends on how the user connects the model: Droid uses a `custom:` ID for a model added through `customModels`, and Composer's ID differs by route. A shipped file cannot know the route, so a bundled definition would be wrong for some users. Setup resolves the ID, so the generated file is correct for that user.

Each harness reads its definitions from its own folder: `.claude/agents/`, `.grok/agents/`, and `.factory/droids/`, in the project or user scope. A plugin that bundles one set of files cannot serve all three, and Droid does not read the Claude manifest's `agents` field. Generating into each folder keeps one mechanism for all three.

When no matching definition is loaded and the harness cannot set the pair per call, polaris reports that the pair does not apply and points the user to `/setup-polaris`. It does not run another pair silently.

`scripts/check_plugin.py` rejects a bundled `agents/`, `droids/`, or `com.anthropic.claude-code/` folder and an `agents` field in any manifest.

Updating from a version that bundled agents removes `polaris:opus-high` and the others. Users who relied on the medium defaults rerun `/setup-polaris`; the README says so.

The working contract is [model budgets](../../skills/polaris/references/models.md#agent-definitions).
