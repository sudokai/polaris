---
name: walkthrough
argument-hint: "[commit | A...B | A..B | pr <n|url>] (no argument = uncommitted changes, current PR, or current branch vs its base)"
description: "Explain a PR, branch, commit, or diff in stages, from purpose and background to the code, then a FAQ and a quiz. Use for /walkthrough, or when asked to explain, walk through, or help understand a change."
---

# Walkthrough

Guided code changeset walkthrough that explains what matters, why the change was made, and how the pieces depend on each other, the way a colleague would. By the end, the user can:

- say what the change is for
- explain how the main pieces work on their own and together
- explain each significant part, and why it was done that way
- spot the risks and follow-ups worth knowing about

## Gather the change

What to collect depends on the argument:

- **No argument:**
  1. If there are uncommitted changes, ask whether to walk through them or the branch (steps 2–3). Collect `git diff`, `git diff --staged`, and the contents of untracked files (`??` in `git status --porcelain`).
  2. Otherwise, if the current branch has an open PR (`gh pr view`), treat it as `pr <n>`.
  3. Otherwise, compare with the base branch: `main`, then `master`, then the remote's default branch (from `git symbolic-ref --short refs/remotes/origin/HEAD`, without the `origin/` prefix). If none exists, stop and tell the user. Collect `git diff <base>...HEAD` and `git log <base>..HEAD --oneline`.
- **A commit:** `git show <ref>`. For a merge commit, ask which parent to compare against.
- **`A...B` or `A..B`:** `git diff` with the argument as given, and `git log A..B --oneline`.
- **`pr <n|url>`:** `gh pr view <n|url> --json title,body,baseRefName,headRefName,files,comments,reviews` and `gh pr diff <n|url>`.

Start with `git diff --stat` (or `git show --stat`) to see the shape of the change. Open a file's diff only when you are about to explain it, per [Guard the Context Window](../principle-guard-the-context-window/SKILL.md). Skip generated code, lockfiles, and formatting-only changes, unless they change behavior, such as a lockfile that upgrades a dependency.

Read the PR description, commit messages, and review comments. If they don't explain the change, infer the purpose from the code, tests, and names. Follow a ticket or issue only if the PR or a commit links to it. Outside stage 2, read code beyond the diff only to answer a specific question, such as how a function the diff calls works, or how one caller uses the changed code.

## How to explain

- **Talk like a colleague.** Use short sentences with one idea each. Explain each term the first time you use it, and use it consistently after that. Use the codebase's terms. Don't praise or sell the code ("elegant", "robust", "simply"). Be exact about names, numbers, and conditions.
- **Match the user's level of expertise.** Judge it from their questions. Basic questions, requests to explain a term, or going back to an earlier stage suggest a beginner: go slower, and add background and examples. Questions about edge cases or specific code suggest an expert: give less background, and go into detail only where they ask.
- **Show, don't tell.** Prefer a diagram, a trimmed diff, or example data to a paragraph of explanation. Use the views of the `show-me` skill (`../show-me/SKILL.md`) to choose the simplest view that is still clear.
- **Separate facts from inferences.** The user will trust what you say, so when you infer, say so: "The tests suggest this handles X, but the commits don't say." If you can't tell what something is for, ask.
- **In every stage, flag what deserves a closer look.** Write **Look closer:** in text or `!` in a diagram, followed by the list of things that deserve a closer look. Together, these notes form a short code review. Check the code you explain for the problems in this list, but don't read code outside the change to find more. Flag two categories:
  - **Possible problems:**
    - **Correctness:**
      - bugs
      - missing edge case handling
      - surprising behavior
      - suspicious defaults
      - unexplained hard-coded numbers
    - **Design:** the red flags in `../architect/references/design-red-flags.md`.
  - **Changes that need a person's attention even when the code looks right:**
    - database migrations
    - new or changed dependencies
    - authentication or permission changes
    - changes that break existing APIs, schemas, or contracts
    - destructive or irreversible operations
    - feature flag changes
    - changed configuration defaults
- **Let the user choose the next stage.** At the end of each stage, say which stage comes next and what it covers. Then ask whether to continue or go to a different stage. For example: "Next is stage 4, Map, which shows how the query, the API, and the feed connect. Should I continue, or go to a different stage?"
  - **Small change** (a few files, one clear purpose): show all stages through the FAQ in one reply, without pausing. Stop before the quiz.
  - **Large change** (hundreds of files, thousands of lines, or several unrelated themes): say so, and offer to go through one theme at a time.

## Stages

Start by listing the stages, so the user knows what's coming:

`Stages: 1. Purpose · 2. Background · 3. Core intuition · 4. Map · 5. Changes by section · 6. FAQ · 7. Quiz`

Give each stage a numbered heading, such as `## 4. Map`, so the user always knows where they are. If a stage has little to say about this change, keep it to a line or two instead of skipping it.

### 1. Purpose

Tell the user what they're looking at.

- **Intent:** the problem the change solves, or what it adds. One short paragraph that someone new to the codebase can follow.
- **Central change:** the part to understand first, because the rest of the change builds on it. Name it in one line, such as "the cursor query in `listPosts`."
- **Scope:** roughly how many commits, files, and lines.
- **Themes:** the files grouped by what they do, not by folder, such as "feed pagination" or "database indexes." Mark which themes are mechanical: they follow from other changes and add no ideas of their own, such as renames, formatting, lockfiles, generated code, call sites updated to a new signature.

### 2. Background

Explain the existing system relevant to this change. Explore it with the `how` skill (`../how/SKILL.md`), on its simple path unless the change spans a whole subsystem. We don't know how much the reader already knows, so include a deep background for beginners, and then a more narrow background directly relevant to the change.

### 3. Core intuition

Explain the idea behind the central change in its simplest form. Illustrate it with realistic example data, leaving out unimportant details. Use the `show-me` views: a pseudocode `diff` or a sequence diagram often works best; for a UI change, sketch the screen before and after; for tricky algorithm or dense UI changes, offer an interactive visualization built with HTML. For example, for a change that switches a feed from page numbers to a cursor:

> Before, the feed asked for "the next 3 posts after skipping the first 3." When a new post arrived between two requests, every post moved down by one, so the reader saw a post twice. Now the feed asks for "the 3 posts older than the last one I saw," so new posts don't change the next page:
>
> ```diff
>  page 1:                   #50  #49  #48
>  post #51 arrives
> -page 2, skip 3:           #48  #47  #46
> +page 2, older than #48:   #47  #46  #45
> ```
>
> The cursor holds the last post's timestamp and ID. The ID decides the order when two posts share a timestamp.

Then explain:

- **Key decisions:** the few choices that explain how the change is organized. For each, say what was chosen and why. Mention any option the author rejected, if the commits, PR, or code show one.
- **Out of scope:** what the change doesn't do. Look for follow-ups mentioned in the commits or the PR, rough edges the author noted, and nearby code left untouched. For untouched code, say whether it looks deliberate or like an oversight. If you find nothing, skip this without comment.

### 4. Map

Divide the change into sections, then draw a map of how they fit together. Stage 5 explains the sections one at a time, in the order you list them here.

**Divide the change into sections.** A section groups the hunks that do one job, such as changing a query, adding an index, or replacing a UI component. A section can take hunks from several files, but unrelated hunks never share a section, even within one file. Tests go with the code they check. Every hunk belongs to exactly one section or to the mechanical summary.

**Order the sections by importance,** not by file path or the author's order, so that a user who stops early has seen what matters most:

1. The central change.
2. The code that follows from it, most important first: the code that calls it, and the logic that changes because of it. When it's easier to follow, put a definition before the code that uses it.
3. Mechanical changes, as a one-line summary.

**Draw the map.** Show how the parts of the change connect to each other and to the existing code, and label each part with its section number. Draw each view as a `diff`, so that `+` lines mark new code and unchanged lines show the existing code around it. Use the `show-me` views to pick: a call tree for control flow, a component tree for UI structure, or a schema or API contract for data. For messages between components, use a sequence diagram instead. If a view grows past about a dozen items, split it into one view per theme, and show the central change in each view.

**List the sections** under the map. Name the files in each section, and say which section deserves the closest read.

For example, for the cursor change:

```diff
 <Feed>
-  <Pagination page={n}>
+  <LoadMoreButton>                         § 4
-    GET /api/posts?page=n
+    GET /api/posts?after=cursor            § 3  ! breaks clients that send ?page=
-      listPosts(page)
+      listPosts(cursor)                    § 1  returns posts older than the cursor
+        index on posts (createdAt, id)     § 2  ! blocks writes while it builds
```

> 1. Page by cursor in `listPosts`: `lib/posts/listPosts.ts`, `lib/posts/listPosts.test.ts`
> 2. Add an index on `posts (createdAt, id)`: `db/migrations/0042_posts_cursor_index.sql`
> 3. Accept a cursor in the posts API: `app/api/posts/route.ts`
> 4. Replace page links with a **Load more** button: `LoadMoreButton.tsx`, `Feed.tsx`, `Pagination.tsx` (deleted)
>
> **Mechanical:** regenerated API types in `lib/api/types.ts`.
>
> Section 3 deserves the closest read: older app versions still send `?page=`.

### 5. Changes by section

Go deeper into each part on the map, one section at a time, in the order Map lists them. Each section zooms in on its part: the code, the reasons behind it, and its effects. For each section, give:

- **Title:** a verb and the specific code, such as "Add an index on `posts (createdAt, id)`." Avoid vague titles such as "Update the data layer."
- **What, why, and what it implies:** what changed, why (especially choices the diff doesn't show), and what it changes about behavior, data, contracts, performance, or how the system is run and deployed. Put each reason next to the fact it explains. For the central change, point back to stage 3 instead of repeating it.
- **Pseudocode first,** when the code is long but the idea is short.
- **Key diff hunks,** ordered like the sections: the hunk that does the section's job first, then what follows from it. Trim each hunk to what matters, without import-only or whitespace-only lines. Describe moved code instead of showing it: "moved unchanged from `utils.ts`." For a hunk you don't show, say what it contributes in one clause.
- **Look closer** notes, right under the hunk they apply to.

If a section uses something that a later section adds, say so.

For example, the first section for the cursor change:

> **1. Page by cursor in `listPosts`.** This is the central change: `listPosts` returns the posts older than the cursor, instead of skipping a number of posts. The query relies on the index that section 2 adds:
>
> ```diff
> -export async function listPosts(page) {
> -  return db.posts.orderBy("createdAt desc").offset(page * 20).limit(20)
> +export async function listPosts(cursor) {
> +  return db.posts
> +    .where("(createdAt, id) < (?, ?)", [cursor.createdAt, cursor.id])
> +    .orderBy("createdAt desc, id desc")
> +    .limit(20)
>  }
> ```
>
> **Look closer:** the first page has no cursor, but `listPosts` reads `cursor.createdAt` without checking for it.

After each section, ask whether to continue, go to a different section, or look closer at this one. To look closer, show the section's full diff and explain the lines that aren't obvious.

### 6. FAQ

Answer the questions the user is most likely to ask about this change, and not covered yet by the walkthrough up to this point. 10 questions max. Keep each answer to a few sentences, pointing to the relevant code. Good questions usually come in these kinds:

- **Why not the obvious alternative?** "Why not keep page numbers and remove duplicate posts in the feed?"
- **What happens to existing data or users?** "What happens to saved links to page 3?"
- **What happens when something fails?** "What does the reader see if loading more posts fails?"
- **Why does this file change?** For a file whose change looks unrelated to the rest.
- **What else does this affect?** Other features, callers, or settings that now behave differently.
- **What did the review comments raise?** For a PR that has them.

### 7. Quiz

Ask questions that only someone who understands the change can answer: 10 questions max. Ask at least one question about the central change. The others can cover design choices, how the pieces work together, edge cases, or your **Look closer** flags. Don't ask trick questions or repeat FAQ questions.

Ask how and why, not for facts the user could look up. "What does `listPosts` return?" is weak. "Why does the next page start after the last post the reader saw, instead of after a number of posts?" is strong. Aim each question at what the kind of change puts at stake. For example, for three kinds of change to the same feed:

- **Feature:** how it behaves at the edges, and why it's built this way. "What happens if the post that the cursor points to is deleted?" "Why does the API return the next cursor, instead of letting the client build it?"
- **Bug fix:** the cause, and how the fix removes it. "Why did posts go missing when two shared a timestamp?" "How does adding the ID to the cursor bring them back without showing any post twice?"
- **Refactor:** what stays the same, and what can now fail. "What stays the same for callers of the endpoints that now use the shared pagination helper?" "Now that every list endpoint uses the same helper, what can go wrong that couldn't before?"

After each answer: if it's right, confirm it; if it's partly right, say what's missing; if it's wrong, help the user find the gap instead of giving the answer.

## Wrap up

When the user is ready to finish, summarize the change in a few lines: its purpose, its central change, and how it changes the structure of the code. Then list every **Look closer** flag and any follow-ups as a checklist.
