---
name: walkthrough
argument-hint: "[commit | A...B | A..B | pr <n|url>] (no argument = uncommitted changes, current PR, or current branch vs its base)"
description: "Explain a PR, branch, commit, or diff as an interactive HTML page, from the problem and its solution to the code, then a FAQ and a quiz. Use when asked to explain, walk through, or help understand a changeset."
---

Write a guided walkthrough of a code changeset. Your job is the thinking: read the diff, understand it, write the guide. The guide is an interactive HTML page: you write its content as `walkthrough.json` and a simulator fragment, and the script in [step 3](#3-build-the-page) renders them.

By the end, the user should be able to:

- know the background and motive behind the change
- understand the main idea, core intuition and logic of the solution
- explain how the main pieces of the solution work separately, and how they fit together
- spot the risks, delicate spots worth a closer look and follow-ups worth knowing about

## 1. Gather the changeset

Decide what the walkthrough covers, then read exactly that diff:

```bash
git diff origin/main...HEAD    # a branch, since it forked
git diff HEAD                  # uncommitted work
git show --format= <sha>       # one commit
```

For a PR, check it out (`gh pr checkout <n>`) and diff against its base branch. New files that were never `git add`ed do not appear in `git diff`; run `git add -N <files>` first if the guide should include them.

## 2. Write the guide

### Identity

You are a senior engineer who deeply understands this changeset and is organizing it into a guided review: an ordered sequence of chapters that let a reviewer understand a large change in one sitting. The chapters are ordered by importance, not by file path or diff size.

You are NOT doing a bug hunt or writing a findings report. Your job is to chapter the diff and, for each chapter, tell the reviewer what changed, why it exists, and what it actually implies: the "this is a big diff, but here is the key part" orientation a reviewer cannot get from reading files in path order.

### Voice

Write like a colleague explaining the change to another capable engineer, out loud, in plain English: assume the reader is skilled but has never seen this codebase. The diff renders next to your words, so your words carry the why and the shape of the change, not the code.

- Short sentences. Twenty-five words is the ceiling and most sentences are shorter. One idea per sentence. If you reach for a dash or a semicolon, end the sentence instead.
- Plain words. Say file, function, module, request, the server. Not artifact, surface, primitive, chain, backbone. Say what a thing does the first time you name it, then use that same name every time.
- Code names go in `<code>` in html fields. Fields that take plain text get the bare name. A sentence must still read as English with the code names covered up. Two per sentence at most.
- No verdicts and no selling: not "elegant", "robust", "seamless", "critically", "importantly", "simply". State the fact.
- Write every chapter in the voice described in `references/say-it-plainly.md`: what a technical colleague explaining the change would say out loud. Keep the technical precision and drop the jargon and stiff phrasing. Write "if the cache is down, people still see the page", not "a degraded cache tier never surfaces failures".
- Write each sentence so that it has none of the three faults in `references/clarify.md`: hidden characters and actions, vague wording, and empty statements or misplaced emphasis.

## Content chapters

Before writing the guide, read the code around the diff and map its structure and how the parts interact. Keep reading until you understand the background, the problem, and the solution.

### Title and lede

The `lede` under the title is one sentence saying what the change does and what that changes for the people or systems it affects. It does not describe the page ("A guided review of…"). Don't add branch names, commit hashes or file counts. Say each idea once: the lede, Solution and Core intuition must not repeat the same summary.

### 1. Orientation

Introduce the parts of the system the change touches, for a skilled engineer who has never seen this codebase.

Start with prose explaining how those parts fit together. Follow it with a glossary using `<dl class="deflist">`, with one term per part.

### 2. Problem

Explain how the affected code behaved before the change and its shortcomings. Illustrate the problem with a concrete example with realistic data.

### 3. Solution

In one short paragraph, explain the solution that the changeset provides. Keep the explanation at the "press release" (outcome) level. The next chapter explains how it works.

### 4. Core intuition

Explain the idea behind the central change in its simplest form. Illustrate it with realistic example data, leaving out unimportant details. Read `references/show-me.md` to find the best way to visualize the change. Write a Mermaid diagram as a `<pre class="mermaid">` block in any html field; the page draws it with [Pele](https://pele.run/). Don't render Mermaid with another tool.

Always include a central interactive model in Core intuition: a **simulator** where the reader changes what matters and sees the result. Pick the shape that fits the change, or mix them:

- **Logic:** the reader changes the inputs (a user's role, whether a feature flag is on, an expired session, an item out of stock) and sees what each part of the system returns.
- **Data:** the reader picks or edits a sample record and sees it before and after the change, or at each step it passes through, such as a migration, an import or a transform.
- **UI:** the reader switches between states (empty, loading, error), screen widths, or before and after, and sees a sketch of the screen.
- **Timing:** the reader steps through events in order (two requests arrive at once, a cache entry expires, a scheduled job runs) and sees the state after each one.
- **Scale:** the reader changes the input size and sees how the work grows before and after the change, such as the number of queries for 10 or 1,000 items.

Follow the format in [walkthrough-json.md](references/walkthrough-json.md#the-simulator-fragment). For a rename or a refactor that changes no behavior, let the reader compare before and after or trace how the parts fit together. Show what stays the same.

Chapters can contain smaller, local demonstrations when a simulator would help the reader understand that part of the change. Place each beside the explanation it supports.

- Derive each simulator's rules from the code in the changeset, not from your summary of it. Before you finish, check each rule against the code again.
- Label made-up values as example data. Check every specific number the simulator shows, such as a timeout, a page size or a retry count, against its constant in the code.
- A UI simulator is a sketch drawn in the page, not the real component. Say so in its note, and take its colors, sizes and text from the changed code.

Then explain:

- **Key decisions:** the few critical design decisions that shaped the changeset. Group them by the question each one answers. For each, say what was chosen, the alternative it was chosen instead of, and why. Link it to the section that implements it, when one does.
- **Tradeoffs:** the solution's tradeoffs, each marked as deliberate or implicit.

### 5. Map

Draw the changeset as a map: one view of all its parts that helps the reviewer find their way around and see how the parts fit together.

Every box links to its section of the changes, and each section has at most one box. Describe in each box what that part does, not which files or classes it touches. Show each system outside the repo that the change depends on, and each component it deletes, as its own band.

### 6. Changes by section

Each section is a chapter of the review: a title, an overview, and one or more diff references.

#### How to ORDER sections

Order by IMPORTANCE, not by file path, diff size, or the order things happened. The reviewer should be able to stop reading after any chapter and have already seen everything that matters most up to that point:

1. The most important chapter comes first: the implementation heart, the part that, once understood, unlocks everything else. The reviewer should never have to dig for the entrypoint.
2. Then the consequences, most important first: call sites updated, downstream logic adjusted, tests for the new behavior. Tests go with the code they exercise unless they are trivial.
3. Glue and low-signal changes come LAST, grouped together so they never interrupt the reading: wiring, imports, renames, config, generated files. Give that trailing chapter an honest plain title ("Wiring and config", "Housekeeping") and a one-or-two-sentence overview; it does not need more.

#### How to CHUNK sections

A section is a logical unit of change, not a file and not a folder. If three files changed for one reason, that is ONE section referencing three files. If one file has two unrelated changes, split it into two sections. Never default to one-section-per-file; let the logic of the change decide.

Chapters follow the natural fault lines of the work: when a changeset carries more than one distinct piece of work (two features, or a feature plus an unrelated refactor), give each its own chapter(s). Unrelated work never shares a chapter.

#### Section fields

- **title**: Concept-level, e.g. "Payment localization module". NEVER a filename paraphrase like "Changes to payments/locale.ts".
- **overview**: HTML, 2-6 sentences. Three jobs, in order:
  1. What changed here, concretely.
  2. Why it exists: the motivation, and non-obvious decisions ("we did X instead of Y because Z" is exactly what a reviewer needs and cannot get from the diff alone).
     Say what problem the change solves. The diff already shows what changed.
     - Bad: "Adds a `requestId` field to the context object."
     - Better: "The retry logic must tell duplicate requests apart, but requests carried no unique ID. `requestId` gives each request one, generated when it arrives."
  3. The key implications: what this changes about system behavior, user experience, API/data contracts, performance, or operations. This is not limited to UI work; a schema migration, a retry-policy change, or an infra swap all have implications worth one plain sentence.
  Where one section carries most of the changeset's risk or deserves the closest read, SAY SO in that section's overview, plainly ("read this section closely: every other section builds on it"). For a genuinely high-risk behavioral shift or contract change, add an `important` or `warning` entry to the section's **callouts**; most sections have none, and don't repeat a callout under **Look closer**.
  In the overview, use formatting only where it sharpens the prose, never as decoration:
  - `<code>` around every file name, symbol, function, type, config key, and CLI flag: `refreshToken`, `--dry-run`, `SESSION_TTL`.
  - `<strong>` for the one clause a skimming reviewer must not miss; at most one per overview.
  - A short bullet list when a section genuinely changes 3+ parallel things; prose otherwise.
  - A tiny `<pre><code>` block (2-5 lines) only when code says it better than a sentence, e.g. a new API shape. Never paste diff hunks into the overview; they belong in the section's **files**.
- **look_closer**: a list of what deserves a closer look, shown as a box after the overview. Leave it out when there's nothing. Don't write it into the overview. Check the code you explain for:
  - **Problems:**
    - **Correctness, aka "the little details":**
      - bugs
      - missing edge case handling
      - surprising behavior
      - suspicious defaults
      - unexplained hard-coded numbers
    - **Design, aka "the overall approach":** the [architectural design red flags](references/design-red-flags.md).
  - **Changes that need a person's attention even when the code looks right:**
    - database migrations
    - new or changed dependencies
    - authentication or permission changes
    - changes that break existing APIs, schemas, or contracts
    - destructive or irreversible operations
    - feature flag changes
    - changed configuration defaults
- **files**: one or more file references. Each has three fields:
  - **path**: the EXACT repo-relative path as it appears in the diff, after the change. Copy it, never invent it, never abbreviate or normalize it (no leading/trailing slash changes, no case changes). `git diff --stat` prints renames as `dir/{old => new}/file.ts`; that is not a path, write `dir/new/file.ts`.
  - **summary**: one sentence describing the semantic change in THIS file, written from the diff hunks you already have. Say what the change does ("extracts the staging logic into a tri-state override map"), not where it sits ("modifies lines 30-80"). Do NOT open the file, search the codebase, or do any per-file investigation to write it. Do not repeat the section overview: the overview carries the why and the implications; the summary says what this specific file contributes. For a trivial change (import bump, rename fallout), one short clause is enough.
  - **hunk**: the changed code of THIS file as simplified diff text. Every file with a meaningful change has at least one hunk, including new files. Do not replace a hunk with a prose description of what the code contains: a summary that lists an enum's values, a parser's cases or a type's fields is a hunk you did not write. Show a hunk for every meaningful change. When in doubt, show it. Trim each hunk to the changed lines that matter plus enough context to place them, and mark cuts with `…`. Never invent lines or alter what a line does.
    - For a new file, show its key lines as `+` lines: the signature, the enum constants, the mapping or the core branch. The page shows a hunk of only `+` lines as plain code with syntax highlighting.
    - When the code is too long or noisy to show as is, use a pseudocode diff or one of the views in `references/show-me.md`, such as a table or a call tree.
    - For a repetitive mechanical change, such as a rename or a signature update at many call sites, show one representative hunk.
    - Omit the hunk when the reviewer could predict this file's diff from the hunks already shown, such as an import bump, a deleted dependency or a call site adjusted to a new signature. The one-sentence summary is enough. A one-line change that turns a feature on, such as a registration, is not predictable: show it.

### 7. FAQ

Answer the questions the user is most likely to ask about this change that the walkthrough has not answered yet. 10 questions max. Keep each answer to a few sentences, pointing to the relevant code. Good questions usually come in these kinds:

- What's the elephant in the room of this change?
- Why this solution and not the obvious alternative?
- Could the solution be simpler? Signs of overengineering?
- What happens to existing data or users?
- Is there a rollback plan in case the deployment fails?
- How robust is this code? What happens when something unexpected fails in production?
- Why does this seemingly unrelated part of the code change?
- What else does this changeset affect?
- What did the review comments raise?

### 8. Quiz

Check that the reader understands the ideas behind the change, not its code. Ask 10 questions at most, favoring these topics in this order:

1. **Core concept:** the main idea and why it works.
2. **Tradeoffs:** what the design gives up, and when the alternative would be better.
3. **Edge cases:** what happens at the boundaries, when something fails, or when the input is unusual.
4. **Interactions:** how the parts depend on each other, and what breaks if one of them changes.
5. **Risks:** the points you flagged under **Look closer**.

Frame each question as a situation or a decision. A reader who followed the walkthrough should be able to answer without remembering a name, a value, or a line of code. Mention a name only when the question is about that thing.

For a change that adds a per-IP rate limit to a login endpoint:

- Bad (recalls code): "What does `RateLimiter.allow` return when the counter is full?"
- Better (core concept): "A user enters a wrong password five times in a row. What happens on the sixth try, and when can they try again?"
- Bad (a fact to look up): "Which class stores the attempt counters?"
- Better (a tradeoff): "Why keep the counters in server memory instead of a database, and what goes wrong when you run two servers?"
- Bad (a detail of the code): "What is the counter's expiry in seconds?"
- Better (an edge case): "An office of 200 people shares one IP address. What happens to them?"

Each question has four options: the right answer and three wrong ones that a reader who skimmed could believe. A wrong option should rest on a real misunderstanding, such as "the old endpoint keeps working", not on something absurd. Put the right answer in a different position from one question to the next. Each question carries a `why`: one or two sentences on why the right answer is right.

Avoid trick questions, repeats of the FAQ, and questions about code the walkthrough doesn't show. Tailor the questions to the kind of change:

- **Feature:** edge cases, and what the design leaves unprotected or unsupported.
- **Bug fix:** the cause, why the fix removes it, and a nearby case it doesn't cover.
- **Refactor:** what behavior must stay the same, and what risks or hidden tradeoffs it carries.

### Calibration: guide, not review

Your job is to EXPLAIN and ORIENT the reviewer, not to critique the code. Pointing out implications and where the risk sits IS orientation: "this section changes the session contract every client depends on" is exactly the job. Hunting for bugs is not; an overview is not a findings list. If you notice something that looks like a real bug while reading, mention it briefly in the relevant section's overview, but do not go looking for problems, and do not let critique crowd out explanation. Most overviews should mention zero bugs; that is normal and expected, not a sign you did not look hard enough. Prefer a diagram, a trimmed diff, or example data to a paragraph of explanation. Before you finish, check each section: where a paragraph or a summary describes code, replace it with the code or a visual of it.

## 3. Build the page

1. Write the content as `walkthrough.json` and the central simulator as `simulator.html`, following [walkthrough-json.md](references/walkthrough-json.md). Put both in a scratch folder, not in the repository.
2. Review the wording. Print every piece of text the reader will see:

   ```bash
   python3 <this skill's folder>/scripts/render_walkthrough.py walkthrough.json --prose
   ```

   Read it all the way through once for each step below, and make every fix in `walkthrough.json`:

   1. Rewrite what doesn't sound like `references/say-it-plainly.md`: figures of speech, jargon, and details the reviewer doesn't need.
   2. Check every sentence, including the ones you just rewrote, for the three faults in `references/clarify.md`, and fix each fault you find. When you can't tell who acts or what a phrase refers to, find the answer in the code instead of asking the user.

   Then reread what you changed.
3. Render the page:

   ```bash
   python3 <this skill's folder>/scripts/render_walkthrough.py walkthrough.json --simulator simulator.html --out walkthrough.html
   ```

   If the script lists problems, fix each one and render again. Don't edit the generated HTML.
4. Open the page once in a browser, at desktop width and at phone width, if you can. Use the central simulator's controls and any local demonstrations, and answer one quiz question. Fix what you see, render again, and stop.
5. If your environment can publish pages, publish `walkthrough.html` privately and give the user the link. Otherwise give its path.

Reply in chat with a few lines: what the change does, the link or path, and anything you flagged under **Look closer** that needs a decision. The page is the walkthrough, so don't repeat its chapters in chat.
