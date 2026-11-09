---
name: finalize-plan
description: "Write a standalone implementation plan .md from an agreed design, including its tradeoffs, ordered steps, acceptance checks, and minimum context for a fresh agent."
---

Turn an agreed design into a concise implementation plan saved as a `.md` file. Write for an agent with no conversation access and for a human reviewing the work before implementation.

Preserve the design. Do not redesign the solution or start implementation. If a missing decision prevents a usable plan, return that gap to the appropriate caller and stop.

## Process

1. **Read the design**. Extract the agreed decisions, rationale, constraints, tradeoffs, and verification requirements. Also extract the concrete details an implementer would otherwise have to guess:
   - API surfaces, interfaces, and type signatures
   - module boundaries, file structure, and data flow
   - naming conventions for files, functions, types, and routes
   - work that was deferred or ruled out

   Put each detail in the section of the plan where it applies. Inspect the relevant code before naming paths or symbols.

2. **Choose the plan path**. Honor an explicit destination. Otherwise, use `<target-repo-root>/docs/plans/<topic>.md`, or `/tmp/plan-<topic>.md` when no repository root is obvious. Use a descriptive topic in kebab case. Create `docs/plans/` when writing its first plan.
   - Preserve existing plans. Choose an unused filename, adding a numeric suffix when needed. Replace an existing plan only when the user explicitly requests that replacement.

3. **Write the plan** using this structure:

   ```markdown
   # Implementation plan: <short title>

   ## Goal

   State the intended result and why it matters.

   ## Key decisions

   State each important decision with its rationale and constraints.

   ## Tradeoffs

   Distinguish these labels:
   - **Explicit:** a tradeoff stated in the design.
   - **Implicit (inferred):** a tradeoff not stated in the design but derived from its constraints or consequences. Explain the inference without presenting it as an agreed decision.

   ## Architecture

   Describe the affected components, responsibilities, interfaces, and state movement. Use a short diagram only when it clarifies these relationships.

   ## Implementation steps

   1. Describe one action, naming the existing or new file and symbol.
   2. Continue in dependency order.

   State relevant failure handling and tests within the appropriate steps.

   ## Acceptance checks

   For each observable completion condition, give its command or operation and expected result. Include user-visible behavior where applicable.

   ## Minimum required context

   - `path/to/existing-file.ts`: explain which contract, convention, or implementation detail to inspect.
   - `path/to/new-file.ts`: identify files to create separately from files to read.
   ```

4. **Keep scope explicit**. Include excluded work and unresolved questions only when they affect implementation or acceptance. Add no empty sections or generic reassurances.

5. **Minimize the reading set**. List only files essential for understanding the contracts or conventions, making the changes, and performing the checks. Explain what the reader needs from each file. Name relevant sections of large files instead of instructing the agent to load every file in full.

6. **Check the plan**. Sweep it for conversation residue using [the checklist](references/sweep-residue.md). Confirm that context files exist, existing paths and symbols are correctly named, and new files are identified. Confirm that the steps implement only the agreed design and the acceptance checks cover the goal. Save the file, return its path and any unresolved decisions, then stop.
