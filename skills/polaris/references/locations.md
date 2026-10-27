# Locations

Where polaris reads and writes its local files, and how it finds local playbooks. Harness-specific paths are in [harness reference](harnesses.md).

## Roots

- **Project root:** the output of `git rev-parse --show-toplevel`, or the current directory outside git.
- **Project polaris root:** `<project>/.agents/polaris/`.
- **User polaris root:** `~/.agents/polaris/` for local playbooks. Model settings use the current harness's configuration directory under [User model settings](#user-model-settings).
- **Bundled:** the plugin's own `skills/` directory. Never edit an installed copy of it. To change a bundled skill locally, copy its folder as [Scope of a change](#scope-of-a-change) describes.

## What goes where

| Category | Project | User |
| --- | --- | --- |
| Model budgets and overrides | `.agents/polaris/models.yaml` | The current harness's [model settings file](harnesses.md#user-model-settings) |
| Local playbooks | `.agents/polaris/playbooks/<name>.md` | `~/.agents/polaris/playbooks/<name>.md` |
| New standalone skills | The project skill directory in [harness reference](harnesses.md) | The user skill directory in [harness reference](harnesses.md) |
| Edits to an existing standalone skill | The directory that holds it | The directory that holds it |
| Edits to a skill installed by a plugin, including polaris | A copy of its folder in the project skill directory | A copy of its folder in the user skill directory |
| Preferences | The project's agent instruction file | Every harness's [global instruction file](writing-global-instructions.md), written once per real file, or one harness's file for a harness-specific rule |
| Correction rule table | The project's agent instruction file | None |
| Deferred repo fixes | `.agents/polaris/backlog.md` | None |
| Resume notes | `.agents/polaris/resume/<slug>.md`, kept out of git | None |

Commit everything under `.agents/polaris/` except `resume/`. User files are usually outside git, so show a diff before writing them.

Choose the scope from the evidence. A lesson about this repository goes to the project. A lesson that holds across projects goes to the user.

## User model settings

Read and write only the current harness's file. Project settings remain shared in `.agents/polaris/models.yaml`. Both scopes keep the `harnesses` mapping defined in [model budgets](models.md).

Use the current harness's path in [harnesses](harnesses.md#user-model-settings).

Do not read or write `~/.agents/polaris/models.yaml`. If it exists, report that it is no longer used. Offer to move the current harness's section into its user model settings file, preserving existing destination settings and the source file. Migrate only when requested.

## Local playbooks

Match a task against the bundled playbook index in [polaris](../SKILL.md) and against every `*.md` file in `<project>/.agents/polaris/playbooks/` and `~/.agents/polaris/playbooks/`. A local playbook uses the format in [playbook authoring](../playbooks/references/writing-playbooks.md), and its scope paragraph is required, because no index line describes it.

If a project playbook and a user playbook share a file name, the project one replaces the user one. A local playbook never replaces a bundled one: if a local playbook has the same file name as a bundled playbook, run the bundled one and tell the user to rename the local file. Say which file you ran.

A local playbook names a skill by name, such as "the `how` skill" or "the `principle-prove-it-works` skill", and you run that skill. Give supporting references absolute paths resolved from the installed plugin. Do not resolve them from the local playbook or the working directory. For example, resolve [model budgets](models.md) in this directory before writing its absolute path into a local playbook.

## Scope of a change

Never edit a skill inside an installed plugin, including polaris's bundled skills and principle skills. To change one, copy its whole folder to the same skill name in the project or user skill directory, and edit the copy. The copy no longer receives updates to that skill. Add to bundled playbooks with local playbooks, not by copying the `polaris` skill. A defect that every polaris user would hit is also a proposal for the plugin's source repository: show it to the user, and do not apply it.
