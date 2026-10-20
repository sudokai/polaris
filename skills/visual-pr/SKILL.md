---
name: visual-pr
description: "Create or update the current branch's PR with a concise description of why the change exists and how it is built, drawn with the show-me views. Use for /visual-pr, or when about to open or update a PR."
disable-model-invocation: true
---

# Describe a pull request

Create or update the pull request for the current task with a concise description that helps a reviewer understand why the change exists and the shape of the implementation.

## Workflow

1. Read the description template, `references/pr-description-template.md`.

2. Identify or create the pull request:
   - Check the current branch for a PR with `gh pr view --json url,number,title,state,baseRefName,headRefName 2>/dev/null`.
   - If no PR exists, inspect `git status --short --branch` and the commits on the current branch.
   - Commit task-related changes when needed, push the branch with an upstream, and create a PR for it. Follow the repository's git safety protocol.
   - Ask the user to select a PR only when the current branch has no relevant work and there is no safe current-branch PR to create.

3. Gather only the context needed to explain the change:
   - Read the ticket and any relevant task artifacts.
   - Read the complete PR diff and enough surrounding code to understand behavior and ownership.
   - Use `gh pr view` to collect PR metadata and changed files.
   - Read the `show-me` skill (`../show-me/SKILL.md`) for the views used in the change outline.

4. Write the PR title and description with [technical-writing](../technical-writing/SKILL.md), excluding Diátaxis. Preserve the description template:
   - Keep **Why the change** to exactly one sentence.
   - Keep **Special things to note** to 1-3 bullets. Prioritize reviewer warnings, migrations, compatibility constraints, deliberate omissions, or surprising decisions. Write `- None.` when there are no special considerations.
   - Make **Change outline** a compact structural view built from the `show-me` views, not prose or a file-by-file changelog.
   - Include only the views that help explain this PR:
     - SQL table and endpoint contract changes, plus pseudocode for business logic.
     - Key data structure and type changes.
     - A shallow file tree showing changed responsibilities.
     - Component tree changes, including important hooks, state, and package boundaries.
     - Call-tree, call-stack, control-flow, or data-flow changes.
   - Prefer `diff` blocks when showing changes to an existing shape. Show the complete target shape when most of it is new or diff notation would obscure ownership or order.
   - Keep each view focused on what a reviewer needs. Omit categories that did not change.
   - If you know a ticket, a plan, or another related link, put it in the header. Otherwise omit the header.

5. Publish the description:
   - Write the body to a temporary file outside the repository.
   - Update the PR with `gh pr edit {number} --body-file {path}`.
   - Confirm the update succeeded with `gh pr view {number} --json body`.

6. Reply with the PR link and title, a 2-3 sentence summary of what the PR does and its key implementation decisions, and one line per changed file saying what changed in it.

Do not expand the PR body beyond the template.

Write as one human talking to another: avoid jargon and slang, and use simple, coherent, concise language.
