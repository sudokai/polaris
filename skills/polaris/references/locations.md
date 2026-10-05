# Locations

Where polaris reads and writes its local files, and how a local skill or playbook takes precedence over the bundled one. Harness-specific paths are in `harnesses.md`.

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
| Bundled skill overrides | `.agents/polaris/skills/<name>/` | `~/.agents/polaris/skills/<name>/` |
| New standalone skills | The project skill directory in `harnesses.md` | The user skill directory in `harnesses.md` |
| Edits to an existing standalone skill | The directory that holds it | The directory that holds it |
| Preferences | The project's agent instruction file | `~/.agents/AGENTS.md`, or the harness's own file for a harness-specific rule (`harnesses.md`) |
| Correction rule table | The project's agent instruction file | None |
| Deferred repo fixes | `.agents/polaris/backlog.md` | None |
| Resume notes | `.agents/polaris/resume/<slug>.md`, kept out of git | None |

Commit everything under `.agents/polaris/` except `resume/`. A file in the user polaris root is usually outside git, so show it as a diff before writing it.

Choose the scope from the evidence. A lesson about this repository goes to the project. A lesson that holds across projects goes to the user.

## Effective skill

Every reference to an polaris skill, such as `../how/SKILL.md`, names the bundled file. Before you follow it, take the first of these that exists:

1. `<project>/.agents/polaris/skills/<name>/SKILL.md`
2. `~/.agents/polaris/skills/<name>/SKILL.md`
3. The bundled `SKILL.md`.

This is the effective skill. The rule applies to the router's triggers, to one skill calling another, to playbook steps, and to a slash command typed directly. When you brief a subagent to run a skill, give it the effective file's absolute path.

An override replaces the bundled `SKILL.md` completely. Never merge the two. Inside an override, resolve each relative path from the override's directory first. If the file is not there, resolve the path from the bundled skill's directory. So an override can replace a reference or script by shipping its own copy, and it can still reach the bundled principles with the path it copied, such as `../polaris/principles/prove-it-works.md`.

An override records what it replaced in its frontmatter: `overrides: polaris <plugin version> skills/<name>`. When the bundled version is newer, tell the user that the override may be missing upstream changes. Do not update the override without approval.

If an override exists but cannot be read, or has no frontmatter `name`, stop and report its path. Do not fall back to the bundled skill.

## Local playbooks

Match a task against the bundled playbook index in `../SKILL.md` and against every `*.md` file in `<project>/.agents/polaris/playbooks/` and `~/.agents/polaris/playbooks/`. A local playbook uses the format in `../playbooks/README.md`, and its scope paragraph is required, because no index line describes it.

If two playbooks share a file name, the project one replaces the user one, and either replaces the bundled one. Say which file you ran.

A local playbook names skills by name, such as "the `how` skill", and you run the effective skill. It names bundled principles and references by their path in the router's directory, such as `principles/prove-it-works.md`.

## Scope of a change

Never edit the bundled skills, playbooks, principles, or index to record a lesson. Override or add locally instead. A defect that every polaris user would hit is a proposal for the plugin's source repository: show it to the user, and do not apply it.
