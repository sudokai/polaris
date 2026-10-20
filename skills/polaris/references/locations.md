# Locations

Where polaris reads and writes its local files, and how it finds local playbooks. Harness-specific paths are in `harnesses.md`.

## Roots

- **Project root:** the output of `git rev-parse --show-toplevel`, or the current directory outside git.
- **Project polaris root:** `<project>/.agents/polaris/`.
- **User polaris root:** `~/.agents/polaris/` for local playbooks. Model settings use the current harness's configuration directory below.
- **Bundled:** the plugin's own `skills/` directory. Never edit an installed copy of it.

## What goes where

| Category | Project | User |
| --- | --- | --- |
| Model budgets and overrides | `.agents/polaris/models.yaml` | The current harness's model settings file below |
| Local playbooks | `.agents/polaris/playbooks/<name>.md` | `~/.agents/polaris/playbooks/<name>.md` |
| New standalone skills | The project skill directory in `harnesses.md` | The user skill directory in `harnesses.md` |
| Edits to an existing standalone skill | The directory that holds it | The directory that holds it |
| Preferences | The project's agent instruction file | Every harness's global instruction file, written once per real file, or one harness's file for a harness-specific rule (`harnesses.md`) |
| Correction rule table | The project's agent instruction file | None |
| Deferred repo fixes | `.agents/polaris/backlog.md` | None |
| Resume notes | `.agents/polaris/resume/<slug>.md`, kept out of git | None |

Commit everything under `.agents/polaris/` except `resume/`. User files are usually outside git, so show a diff before writing them.

Choose the scope from the evidence. A lesson about this repository goes to the project. A lesson that holds across projects goes to the user.

## User model settings

Read and write only the current harness's file. Project settings remain shared in `.agents/polaris/models.yaml`. Both scopes keep the `harnesses` mapping defined in `models.md`.

Use the current harness's path in [harnesses](harnesses.md#user-model-settings).

Do not read or write `~/.agents/polaris/models.yaml`. If it exists, report that it is no longer used. Offer to move the current harness's section into its user model settings file, preserving existing destination settings and the source file. Migrate only when requested.

## Local playbooks

Match a task against the bundled playbook index in `../SKILL.md` and against every `*.md` file in `<project>/.agents/polaris/playbooks/` and `~/.agents/polaris/playbooks/`. A local playbook uses the format in `../playbooks/README.md`, and its scope paragraph is required, because no index line describes it.

If a project playbook and a user playbook share a file name, the project one replaces the user one. A local playbook never replaces a bundled one: if a local playbook has the same file name as a bundled playbook, run the bundled one and tell the user to rename the local file. Say which file you ran.

A local playbook names a skill by name, such as "the `how` skill" or "the `principle-prove-it-works` skill", and you run that skill. It names a reference by its path in the router's directory, such as `references/models.md`.

## Scope of a change

Never edit the bundled skills, including principle skills, playbooks, or the router index to record a lesson, and never copy one to change it locally. Record the lesson in a local playbook, a standalone skill, or an instruction file instead. A defect that every polaris user would hit is a proposal for the plugin's source repository: show it to the user, and do not apply it.
