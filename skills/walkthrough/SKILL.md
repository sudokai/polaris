---
name: walkthrough
argument-hint: "[commit | A...B | A..B | pr <n|url>] (no argument = uncommitted changes, current PR, or current branch vs its base)"
description: "Explain a PR, branch, commit, or diff using a structured format, from background and purpose to the code, then a FAQ and a quiz. Use when asked to explain, walk through, or help understand a changeset."
---
# Walkthrough

Structured walkthrough of a code changeset, used for guided reviews. Your job is the thinking: read the diff, understand it, create the walkthrough.

By the end, the user should be able to:

- know just enough background and context needed before diving into the changeset
- grasp the purpose of the changeset, and why it is needed,
- understand the core idea, intuition and logic behind it
- explain how the main pieces work separately, and then how they fit together
- spot the risks, delicate spots worth a closer look and follow-ups worth knowing about

## 1. Gather the changeset

Decide what the walkthrough covers, then read exactly that diff:

```bash
git diff origin/main...HEAD    # a branch, since it forked
git diff HEAD                  # uncommitted work
git show --format= <sha>       # one commit
```

For a PR, check it out (`gh pr checkout <n>`) and diff against its base branch. New files that were never `git add`ed do not appear in `git diff`; run `git add -N <files>` first if the guide should include them.  

## 2. Create the walkthrough

### Identity

You are a senior engineer who deeply understands this changeset and is organizing it into a guided review: an ordered sequence of chapters that let a reviewer understand a large change in one sitting. The chapters are ordered the way the work was actually reasoned through, not by file path or diff size.

You are NOT doing a bug hunt or writing a findings report; just flag what you notice. Your job is to chapter the diff and, for each chapter, tell the reviewer what changed, why it exists, and what it actually implies: the "this is a big diff, but here is the key part" orientation a reviewer cannot get from reading files in path order.

### Voice

Write like a colleague explaining the change to another capable engineer, out loud, in plain English: assume the reader is skilled but has never seen this codebase. The diff renders next to your words, so your words carry the why and the shape of the change, not the code.

- Short sentences. Twenty-five words is the ceiling and most sentences are shorter. One idea per sentence. If you reach for a dash or a semicolon, end the sentence instead.
- Plain words. Say file, function, module, request, the server. Not artifact, surface, primitive, chain, backbone. Say what a thing does the first time you name it, then use that same name every time.
- Code names go in backticks, and a sentence must still read as English with them covered up. Two per sentence at most.
- No verdicts and no selling: not "elegant", "robust", "seamless", "critically", "importantly", "simply". State the fact.

Use the `say-it-plainly` skill to communicate with the user. 

### Speed

Match the user's level of expertise. Judge it from their questions and followups. Basic questions, requests to explain a term, or going back to an earlier stage suggest a beginner: go slower, and add more background and examples with data, use the skill `say-it-plainly`. Questions about edge cases or specific code suggest an expert: get to the point fast, and go into detail only where they ask, without adding unnecessary preamble.

### Show, don't tell

Prefer a diagram, a trimmed diff, or example data to a paragraph of explanation. Use the views of the `show-me` skill to choose the simplest view that is still clear.

## Stages of the walkthrough

### 1. Background

Give the user just enough prior background and context relevant to the changeset, so that they are well prepared to understand the changeset at hand. Explore the call stack and code surrounding the diffs with the `how` skill on its simple path. We don't know how much the reader already knows, so include a general background for beginners, and then a more narrow background directly tied to the change.

### 2. Purpose

Tell the user the intent/purpose of the changeset and the problem it solves. One short paragraph that someone new to the codebase can follow.

### 3. Core intuition

Explain the idea behind the central change in its simplest form. Illustrate it with realistic example data, leaving out unimportant details. Use the `show-me` views: a pseudocode `diff` or a sequence diagram often works best; for a UI change, sketch the screen before and after; for tricky algorithm or dense UI changes, offer an interactive visualization built with HTML. 

Then explain:

- **Key decisions:** the few choices that explain how the change is organized. For each, say what was chosen and why. Mention any option the author rejected, if the commits, PR, or code show one.
- **Out of scope:** what the change doesn't do. Look for follow-ups mentioned in the commits or the PR, rough edges the author noted, and nearby code left untouched. For untouched code, say whether it looks deliberate or like an oversight. If you find nothing, skip this without comment.

Use the `why` skill as needed.

### 4. Map

Visually represent the changeset as a map, giving the user a bird's eye view and a mental map of the entire changeset.

Show how the parts of the change connect to each other and to the existing underlying code. Use the `show-me` views to pick the best visual representation. If the map is very large and complex, split it into several sub-maps.

### 5. Changes by section

Each section is a chapter of the review: a title, an overview, and one or more diff references.

#### How to ORDER sections

Order by IMPORTANCE, not by file path, diff size, or the order things happened. The reviewer should be able to stop reading after any chapter and have already seen everything that matters most up to that point:

1. The most important chapter comes first: the implementation heart, the part that, once understood, unlocks everything else. The reviewer should never have to dig for the entrypoint.
2. Then the consequences, in decreasing signal: call sites updated, downstream logic adjusted, tests for the new behavior. Tests go with the code they exercise unless they are trivial.
3. Glue and low-signal changes come LAST, grouped together so they never interrupt the reading: wiring, imports, renames, config, generated files. Give that trailing chapter an honest plain title ("Wiring and config", "Housekeeping") and a one-or-two-sentence overview; it does not need more.

#### How to CHUNK sections

A section is a logical unit of change, not a file and not a folder. If three files changed for one reason, that is ONE section referencing three files. If one file has two unrelated changes, split it into two sections. Never default to one-section-per-file; let the logic of the change decide.

Chapters follow the natural fault lines of the work: when a changeset carries more than one distinct piece of work (two features, or a feature plus an unrelated refactor), give each its own chapter(s) — unrelated work never shares a chapter.

#### Section fields

- **title**: Concept-level, e.g. "Payment localization module". NEVER a filename paraphrase like "Changes to payments/locale.ts".
- **overview**: Markdown, 2-6 sentences, plus an optional **Look closer** list. Three jobs, in order:
  1. What changed here, concretely.
  2. Why it exists: the motivation, and non-obvious decisions ("we did X instead of Y because Z" is exactly what a reviewer needs and cannot get from the diff alone).
     Say what problem the change solves. The diff already shows what changed.

     - Weak: "Adds a `requestId` field to the context object."
     - Better: "The retry logic must tell duplicate requests apart, but requests carried no unique ID. `requestId` gives each request one, generated when it arrives."

  3. The key implications: what this changes about system behavior, user experience, API/data contracts, performance, or operations. This is not limited to UI work; a schema migration, a retry-policy change, or an infra swap all have implications worth one plain sentence.
  Where one section carries most of the changeset's risk or deserves the closest read, SAY SO in that section's overview, plainly ("this is the part worth slowing down for; everything else follows from it"). Use a `> [!IMPORTANT]` or `> [!WARNING]` callout line for a genuinely high-risk behavioral shift or contract change; most sections should have none, and don't repeat it under **Look closer**.
  End with **Look closer:** and a list of what deserves a closer look, or omit it if there's nothing. Check the code you explain for:
  - **Problems:**
    - **Correctness, aka "the little details":**
      - bugs
      - missing edge case handling
      - surprising behavior
      - suspicious defaults
      - unexplained hard-coded numbers
    - **Design, aka "the overall approach":** the [architectural design red flags](../architect/references/design-red-flags.md).
  - **Changes that need a person's attention even when the code looks right:**
    - database migrations
    - new or changed dependencies
    - authentication or permission changes
    - changes that break existing APIs, schemas, or contracts
    - destructive or irreversible operations
    - feature flag changes
    - changed configuration defaults
    Markdown is supported and encouraged where it genuinely sharpens the prose, never as decoration:
  - Backticks around every file name, symbol, function, type, config key, and CLI flag: `refreshToken`, `--dry-run`, `SESSION_TTL`.
  - **Bold** for the one clause a skimming reviewer must not miss; at most one per overview, besides **Look closer**.
  - A short bullet list when a section genuinely changes 3+ parallel things; prose otherwise.
  - A tiny fenced code block (2-5 lines) only when code says it better than a sentence, e.g. a new API shape. Never paste diff hunks into the overview; they belong in the section's **diffs**.
- **diffs**: one or more file references. Each has three fields:
  - **file**: the EXACT repo-relative path as it appears in the diff, after the change. Copy it, never invent it, never abbreviate or normalize it (no leading/trailing slash changes, no case changes). `git diff --stat` prints renames as `dir/{old => new}/file.ts`; that is not a path, write `dir/new/file.ts`.
  - **summary**: 1-2 sentences describing the semantic change in THIS file, written from the diff hunks you already have. Say what the change does ("extracts the staging logic into a tri-state override map"), not where it sits ("modifies lines 30-80"). Do NOT open the file, search the codebase, or do any per-file investigation to write it. Do not repeat the section overview: the overview carries the why and the implications; the summary says what this specific file contributes. For a trivial change (import bump, rename fallout), one short clause is enough.
  - **hunks**: the changed code of THIS file as simplified `diff` blocks. Show a hunk for every meaningful change. When in doubt, show it. Trim each hunk to the changed lines that matter plus enough context to place them, and mark cuts with `…`. Never invent lines or alter what a line does. For a repetitive mechanical change, such as a rename or a signature update at many call sites, show one representative hunk. Omit hunks only when a change has no behavior and the summary already states it.

### 6. FAQ

Answer the questions the user is most likely to ask about this change, and not covered yet by the walkthrough up to this point. 10 questions max. Keep each answer to a few sentences, pointing to the relevant code. Good questions usually come in these kinds:

- **Why not the obvious alternative?**
- **What happens to existing data or users?**
- **What happens when something fails?**
- **Why does this file change?**
- **What else does this affect?**
- **What did the review comments raise?**

### 7. Quiz

Ask questions that only someone who understands the change can answer: 10 questions max. Ask at least one question about the central change. The others can cover design choices, how the pieces work together, edge cases, or your **Look closer** flags. Don't ask trick questions or repeat FAQ questions.

Ask how and why, not for facts the user could look up. "What does `listPosts` return?" is weak. "Why does the next page start after the last post the reader saw, instead of after a number of posts?" is strong. Aim each question at what the kind of change puts at stake. For example, for three kinds of change to the same feed:

- **Feature:** how it behaves at the edges, and why it's built this way. "What happens if the post that the cursor points to is deleted?" "Why does the API return the next cursor, instead of letting the client build it?"
- **Bug fix:** the cause, and how the fix removes it. "Why did posts go missing when two shared a timestamp?" "How does adding the ID to the cursor bring them back without showing any post twice?"
- **Refactor:** what stays the same, and what can now fail. "What stays the same for callers of the endpoints that now use the shared pagination helper?" "Now that every list endpoint uses the same helper, what can go wrong that couldn't before?"

After each answer: if it's right, confirm it; if it's partly right, say what's missing; if it's wrong, help the user find the gap instead of giving the answer.

## Wrap up

When the user is ready to finish, summarize the change in a few lines: its purpose, its central change, and how it changes the structure of the code. Then list every **Look closer** flag and any follow-ups as a checklist.