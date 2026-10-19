# Locations

Where polaris reads and writes its local files, and how it finds local playbooks. Harness-specific paths are in `harnesses.md`.

## Roots

- **Project root:** the output of `git rev-parse --show-toplevel`, or the current directory outside git.
- **Project polaris root:** `<project>/.agents/polaris/`.
- **User polaris root:** `~/.agents/polaris/`.
- **Bundled:** the plugin's own `skills/` directory. Never edit an installed copy of it.

## What goes where

| Category | Project | User |
| --- | --- | --- |
| Model overrides | `.agents/polaris/models.md` | `~/.agents/polaris/models.md` |
| Local playbooks | `.agents/polaris/playbooks/<name>.md` | `~/.agents/polaris/playbooks/<name>.md` |
| New standalone skills | The project skill directory in `harnesses.md` | The user skill directory in `harnesses.md` |
| Edits to an existing standalone skill | The directory that holds it | The directory that holds it |
| Preferences | The project's agent instruction file | `~/.agents/AGENTS.md`, or the harness's own file for a harness-specific rule (`harnesses.md`) |
| Correction rule table | The project's agent instruction file | None |
| Deferred repo fixes | `.agents/polaris/backlog.md` | None |
| Resume notes | `.agents/polaris/resume/<slug>.md`, kept out of git | None |

Commit everything under `.agents/polaris/` except `resume/`. A file in the user polaris root is usually outside git, so show it as a diff before writing it.

Choose the scope from the evidence. A lesson about this repository goes to the project. A lesson that holds across projects goes to the user.

## Local playbooks

Match a task against the bundled playbook index in `../SKILL.md` and against every `*.md` file in `<project>/.agents/polaris/playbooks/` and `~/.agents/polaris/playbooks/`. A local playbook uses the format in `../playbooks/README.md`, and its scope paragraph is required, because no index line describes it.

If a project playbook and a user playbook share a file name, the project one replaces the user one. A local playbook never replaces a bundled one: if a local playbook has the same file name as a bundled playbook, run the bundled one and tell the user to rename the local file. Say which file you ran.

A local playbook names skills by name, such as "the `how` skill", and you run that skill. It names bundled principles and references by their path in the router's directory, such as `principles/prove-it-works.md`.

## Scope of a change

Never edit the bundled skills, playbooks, principles, or index to record a lesson, and never copy one to change it locally. Record the lesson in a local playbook, a standalone skill, or an instruction file instead. A defect that every polaris user would hit is a proposal for the plugin's source repository: show it to the user, and do not apply it.
