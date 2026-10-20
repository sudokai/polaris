---
name: finalize-plan
description: "Write a standalone implementation plan .md from the agreed design, with no chat references and a list of every file needed to rebuild context."
disable-model-invocation: true
---

# Finalize an implementation plan

Turn a settled design from the conversation or supplied design files into a concise implementation plan saved as a `.md` file.

Reuse the design and its rationale. Do not redesign the solution or start implementation. If a missing decision prevents a usable plan, return that gap to the caller.

Write with [technical-writing](../technical-writing/SKILL.md). Preserve the plan structure below. Keep implementation steps separate from rationale and reference sections.

Write for a fresh agent with no access to the conversation.

## Process

1. **Read the design**. Extract the decisions, rationale, constraints, and details needed for the sections below from the conversation or supplied files.

2. **Choose the plan path**. Honor an explicit destination. Otherwise, use `<target-repo-root>/plan-<topic>.md`, or `/tmp/plan-<topic>.md` if no repo root is obvious. Use a descriptive topic in kebab case.
   - Preserve existing plans. Choose an unused filename, adding a numeric suffix when needed. Replace an existing plan only when the user explicitly requests that replacement.

3. **Write the plan**. Include these sections:

   ```markdown
   # Implementation plan: <short title>

   ## Goal

   Summarize the intended result and why it matters.

   ## Decisions

   Bullet list of key decisions. Each entry must carry its own rationale.
   Use present tense: "Use X over Y because Z" (not "We decided...").

   ## Deferred and out of scope

   List excluded work and open questions.

   ## Architecture

   If there are multiple components or modules, show how they fit together.
   Use a short ASCII diagram or a bullet list of responsibilities.

   ## Implementation steps

   1. Describe one action. Name the file and symbol to change.
   2. Continue in dependency order.
   3. ...

   **Handling errors**. State how each relevant failure reaches the caller or user.

   **Tests**. Name tests to add or update. If none are needed, say why.

   ## Acceptance criteria

   List observable completion conditions and how to check them. For example:

   - "GET /api/users returns 200 with a JSON array of user objects"
   - "Running `pnpm test` passes all tests"
   - "The error toast appears when the API call fails (check manually in the browser)"

   ## Read these files

   Read these files in full before writing code:

   - `path/to/file.ts`. Explain its role.
   ```

4. **Complete "Read these files"**. List every codebase file needed to rebuild context, including affected code, relevant examples, configuration, schemas, and tests.

5. **Check acceptance criteria**. Include commands or observable behaviors with expected results. A passing test suite alone does not establish a user-visible result.

6. **Save and check the plan**. Check that the listed context files exist. Identify files to create separately. Confirm that the steps match the settled design. Return the plan path and any unresolved decisions, then stop.
