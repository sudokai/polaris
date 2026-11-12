`{RELEVANT LINK}`  | `{RELEVANT LINK 2}`  | ...

## Why the change

{Exactly one sentence explaining the problem this PR solves and what becomes possible after it ships.}

## Special things to note

- {List 1-3 reviewer-relevant warnings, migrations, constraints, deliberate omissions, or surprising decisions. Use "None." when there are no special considerations.}

## Change outline

{Use the fewest views from `show-me.md` that explain the implementation; the blocks below sketch the common ones. Prefer `diff` blocks for changes to existing shapes and complete blocks for mostly new shapes. Do not include headings for views that are not relevant.}

{...short-description...}

```diff|sql|json|etc
{Show changed SQL tables, important columns and relationships, and endpoint request/response contracts.}
```

{...short-description...}

```typescript|python|etc
{show new data structures that are key to the implementation}
```

{...short-description...}

```diff
{Show concise pseudocode for the changed behavior.}
```


{...short-description...}

```diff
{Show a shallow file tree with changed responsibilities.}
```


{...short-description...}

```diff
{Show changed React component trees, important hooks or state, and package boundaries.}
```

{...short-description...}

```diff
{Show changed call trees, call stacks, control flow, or data flow.}
```

{Order the views so the story is easiest to follow: files first, or a data structure, SQL table, or API contract first. All views and subheadings are optional; name and order them to fit the change. Write the outline as one human would write to another. Show a complete shape in a language-specific or `text` block when it is new, high-level, or clearer without diff notation.}
