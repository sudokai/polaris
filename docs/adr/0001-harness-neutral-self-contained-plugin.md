# Harness-neutral, self-contained plugin

polaris keeps pstack's router, principle, playbook, and skill architecture, but shares one set of methods across harnesses. Harness-specific capabilities, model routes, setup steps, and packaging belong in explicit references and adapters. This avoids maintaining a separate method for each harness while allowing their controls to differ.

Every skill polaris depends on ships in the plugin. Depending on the user's separately installed skills would make the same plugin behave differently across installations. Shared methods have one owner: callers read that method instead of copying its rules. Imported files retain their license notices.

Installation uses each harness's supported mechanism. Packaging may include harness-specific manifests and agent definitions when the portable plugin format cannot express the required controls. A successful file install does not prove that a running harness loaded the update.

Personal reply preferences belong in the user's instruction files. Upstream imports preserve polaris's adaptations instead of copying upstream model names, version numbers, or harness assumptions.

The working contracts are [harness facts](../../skills/polaris/references/harnesses.md), [model budgets](../../skills/polaris/references/models.md), and the repository's [installation instructions](../../README.md). [Upstream sync](../upstream-sync.md) records where porting resumes.
