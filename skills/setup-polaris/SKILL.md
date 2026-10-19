---
name: setup-polaris
description: "Choose a polaris model profile and budget, with optional category overrides and fallbacks, for this project or every project. Use for /setup-polaris, configure polaris models, or changing polaris's model choices."
disable-model-invocation: true
---

# Setup polaris

Configure delegated assignments using `../polaris/references/models.md`. Read it first; it owns category meanings, defaults, YAML syntax, precedence, fallback authorization, and harness application. Load only the selected profile table. Do not change the main conversation's model.

## 1. Identify the harness and its controls

Identify `claude-code`, `codex`, `cursor`, `pi`, `dsh`, `grok-build`, or `hermes` from the available tools. If unknown, report that setup cannot apply model choices here.

- **Hermes:** explain that its existing delegation settings apply, otherwise children inherit the main conversation's settings. GPT is a suggestion only. Leave Hermes configuration untouched, do not save a misleading category-routing table, and stop.
- **pi:** an installed extension must provide subagents. Inspect its actual model/thinking-level fields. If no suitable extension exists, explain the limitation and stop.
- **dsh:** the subagent tool must expose model selection. If it does not, explain the relevant setting and stop rather than save an ineffective table:
  - Desktop: **Plugins → Official → Subagent**, enable model selection and allow the intended models.
  - Command-line profile: inspect `dsh --profile <profile> --dump-config` for the entry named `@deepseek-ai/dsh-tool-subagent/model-selection-settings`. Add a patch to that profile's `~/.dsh/profiles/<profile>/cordis.patch.yml`, using its actual entry ID:

    ```yaml
    - id: <model-selection-settings-id>
      config:
        enabled: true
        allowedModels:
          - provider: <provider>
            model: <model>
    ```

  The session preset must also request model-selection fields. Start a new session after changing these settings; do not edit the profile merely because setup was invoked.

## 2. Read configuration and detect capabilities

Read the current harness section from `.agents/polaris/models.yaml` and `~/.agents/polaris/models.yaml`. Merge settings as `models.md` specifies; do not read or migrate legacy role files. Suggest the existing profile/budget, otherwise the harness default and medium.

Detect model IDs, connection routes, supported efforts, tool support, and required image support from the harness:

| Harness | Capability source |
| --- | --- |
| Claude Code | Current spawn schema and model controls; inspect whether per-invocation effort is exposed. Otherwise use loaded agent definitions. |
| Codex | Spawn schema and `~/.codex/models_cache.json` supported reasoning efforts. |
| Cursor | Accepted spawn slugs/parameters and model settings, including the Composer tier. |
| Grok Build | `grok models`, loaded agents, and provider documentation. Missing entries alone do not rule out Composer; confirm callable IDs on the selected connection. |
| pi | `pi --list-models`, model thinking maps, and the installed subagent extension's schema. |
| dsh | `list_subagent_models` allowed providers/models and reasoning efforts. |

Do not assume an account can run a model because another harness or catalogue lists it. Mark uncertain access as unverified. Use a minimal harmless model check when the session permits one; do not launch the full task to discover access. Resolve multiple account routes with the user. Keep credentials in the harness's existing configuration.

## 3. Resolve the desired table

Offer accessible profiles (`claude`, `gpt`, `xai`, `deepseek`, `glm`), a budget (`small`, `medium`, `large`, `unlimited`), and optional category overrides. Fixed overrides survive budget changes; show inherited overrides when changing profile or budget. Offer configured fallback connections only when needed, not as a mandatory interview about every category.

Use the selected profile's exact pairs. Do not infer a new table from effort offsets or add agents to obtain cheaper models. If Composer is unavailable, show the xAI Grok-only column and save its resolved allocations as explicit category overrides after the user chooses it; do not silently mix its table with the Composer runtime fallback.

Resolve each unsupported allocation through an explicit profile fallback or an ordered user-configured fallback list. Ask for a supported effort when no documented mapping exists. A cross-provider fallback requires an explicitly named configured connection. Validate required capabilities on fallback pairs too. Do not save unresolved model IDs, unsupported efforts, credentials, or an unverified table described as usable.

Show all seven categories with the selected and effective pairs, source (bundled/user/project override), connection, fixed overrides, fallback order, availability evidence, and reload requirements. Ask whether to save for **this project** or **every project**. The user's prior instruction selecting scope or settings is sufficient; do not ask twice.

## 4. Save configuration and required definitions

Write only the selected scope's settings to `.agents/polaris/models.yaml` or `~/.agents/polaris/models.yaml`. Preserve other harness sections and unrelated settings. Omit unchanged defaults; remove a setting when the user resets it so the next scope applies. Do not erase an intentional empty fallback list. Show a diff before writing a user-scope file outside git, as `../polaris/references/locations.md` requires.

For harnesses needing agent definitions, follow **Agent definitions** in `models.md`. Generate one per distinct resolved primary/fallback pair rather than per category. Inspect loaded definitions before using them; same name does not prove same settings. Write only polaris-owned definitions needed for this selection, preserving unrelated files. Repeating setup with the same choices must produce the same configuration and definitions.

Read back the saved YAML and definitions. Check that the effective configuration still resolves to the displayed table. If the save or validation fails, report the exact file and remedy; do not claim the change took effect. New definitions may need a new session or reload; state that before suggesting they can be used.

## 5. Report and offer verification skills

Report the profile, budget, resolved pairs and sources, paths written, substitutions, and unverified access or loading. Distinguish saved configuration from a confirmed running child. Report a harness-imposed limitation rather than silently inheriting a different pair.

Make each offer once, skipping offers the project already has:

- **App verification:** if no `verify-<app>` skill or other scripted way to drive the app exists, offer the Set up verification playbook (`../polaris/playbooks/set-up-verification.md`).
- **Formal verification:** if no formal verification skill exists, offer `../create-formal-verification-skill/SKILL.md` for a key property worth checking across all states in scope.

Proceed with an offer only when accepted; on no, move on.
