---
name: how
description: "Use for \"how does X work\", explanations of existing code before changing something, and placement / ownership / layering questions (\"where should this live\", \"which package owns this\", \"is this the right layer\"). Explains subsystem architecture, runtime flow, onboarding mental models. Use why for motivation."
disable-model-invocation: true
---

# How

Explore the codebase to answer "how does X work?" questions. Produce architectural explanations at the level of a senior engineer onboarding onto a subsystem, enough to build a working mental model, not so much that it reads like annotated source code.

Classify each exploration assignment by its uncertainty. Choose its model with [model budgets](../polaris/references/models.md). Explorers only read and search the code. They never edit files. You write the explanation yourself.

## Step 1. Assess Complexity

If the scope is ambiguous, state your interpretation and explore. The user can redirect.

- **Simple** (a single module, a small utility, a narrow question such as "how does function X work"): no explorers. Go to Step 2b.
- **Complex** (a subsystem spanning multiple files or services, a cross-cutting feature, a full architectural overview): start parallel explorers first, then write the explanation from their findings. Go to Step 2a.

When in doubt, take the simple path.

## Step 2a. Explore (complex questions only)

Decompose the question into 2 to 4 exploration angles, each a distinct slice of the subsystem. Start all explorers at once, normally classified as `kind: execution`, `level: regular`. Use `kind: reasoning`, `level: hard` for a slice requiring unfamiliar reasoning rather than straightforward source exploration.

Each explorer gets the [exploration prompt](references/explorer-prompt.md) with its angle filled in. Then go to Step 3.

## Step 2b. Explore (simple questions only)

Read and search the code yourself. Then go to Step 3.

## Step 3. Explain

Write the explanation following [explanation format](references/explanation-format.md). For a complex question, reconcile the explorers' findings first: merge overlaps, and resolve contradictions by checking the code.

## Output Format

The explanation uses the sections defined in [explanation format](references/explanation-format.md), dropping any that do not apply: Overview, Key Concepts, How It Works, Where Things Live, Gotchas.
