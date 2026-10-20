---
name: write-discoverable-code
description: "Rules for writing code that agents and humans can find through plain-text search. Apply whenever writing or renaming functions, types, constants, files, error messages, or doc comments."
license: MIT
---

# Write discoverable code

Coding agents discover code by searching for strings and reading small windows around the
hits. They have no hover text, no jump-to-definition, and no memory between sessions. These
rules make code resolvable in one search instead of five.

The rules apply in any language. Examples use TypeScript; section 2 lists the equivalents
in Java, Go, Rust, Python, and JavaScript.

## 1. Names are search queries

- **Exported symbols get 2–4 word names, at least one of them a domain word.**
  `diffUserObjects`, not `diff`. `queueEventForDispatch`, not `queue`.
  Measured on a ~700k-line monorepo: 1-word exported names are globally unique 61% of
  the time; 3-word names 96%; 4+ words 98%. Three words is the knee of the curve.
  Use the shortest name that greps uniquely; put the rest in the doc comment.
- **Give generic verbs their object.** `sanitizeEmailHtml`, not `sanitize`;
  `validateSmtpConfig`, not `validateConfig`. Qualify only as far as uniqueness
  requires, then stop.
- **One definition site per symbol.** Never copy a function between files; move it and
  delete the original in the same change. Shared helpers get one concept-named home
  and are imported everywhere else.
- **Do not rely on the module path to disambiguate a generic name.** The import that
  disambiguates `users/diff.ts` from `orders/diff.ts` sits at the top of the file; the
  search hit is at line 300. Put the context in the symbol (`formatDurationMs`), not the
  folder. Exception: rigid, absolute conventions where the path carries the meaning
  (e.g. every contract file exporting `Input`/`Output`).
  - **Go:** Go puts the package name at every call site, and its linters flag names that
    repeat it (`billing.BillingDiff`). Call sites still grep well (`billing.Diff`), but the
    definition reads `func Diff(`. Name the object instead of repeating the package:
    `billing.DiffPlans`, not `billing.Diff`. If the codebase consistently uses short
    package-qualified names, follow it.
- **One concept, one spelling.** Pick `organizationId` or `orgId` and use it everywhere;
  every synonym splits every future search in half. Reuse existing vocabulary in the
  codebase you are editing rather than introducing near-synonyms.
- **Use named exports, not default exports** (JavaScript and TypeScript). With a default
  export, each importer picks its own local name (`import diff from './users'`,
  `import diffUsers from './users'`), so one function is searched under several names.
  A named export keeps one spelling at every import site. For the same reason, in any
  language, alias an import (`import { x as y }`, `from m import f as g`) only to resolve
  a real name collision.
- **When behavior or audience changes, rename in the same commit.** A stale name is
  misinformation with a 100% open rate — that includes visibility markers: a `_private`
  helper that other modules now import needs a public name.
- **Filenames are names too — never use bare-role filenames.** `config.ts`, `types.ts`,
  `utils.py`, `helpers.go`, `handlers.js` say nothing in a search result and collide with
  every other module's config/types/utils in the repo. Prefix the domain:
  `billing-plan-config.ts`, not `config.ts`. Thin re-export entry points (`index.ts`,
  `__init__.py`, `mod.rs`) are the exception. In Java the filename is the class name, so
  the rules for type names cover it.

## 2. Types are the documentation agents can't skip

Design types and signatures per [Type System Discipline](../principle-type-system-discipline/SKILL.md), including exhaustive handling of variants and deriving types from authoritative schemas.

- **Give each kind of ID its own type.** A
  `transferOwnership(userId: string, orgId: string)` signature makes argument
  transposition invisible; distinct ID types make it a compile error that names the concepts.
- **Use capability-token parameter types** for privileged operations (e.g. requiring an
  `OrgScopedDb` instead of a raw connection). A comment is a request; a required type is
  physics.
- **Model state with discriminated unions**, not clusters of nullable fields with implicit
  rules.
- **Name types like they'll be quoted back** — they will be, in compiler errors the agent
  uses to self-correct. `OrgScopedDb` explains itself; `Ctx2` does not. Avoid escape
  hatches such as `any`: each one is a spot where the compiler goes silent and the agent
  is back to guessing.

How to express these rules in each language:

| Language | Distinct ID type | State union | Escape hatches to avoid |
| --- | --- | --- | --- |
| TypeScript | `z.string().brand<'UserId'>()` or `string & { __brand: 'UserId' }` | `{ kind: 'active' } \| { kind: 'suspended'; reason: string }` | `any`, `as` casts |
| Java | `record UserId(String value) {}` | `sealed interface` with `record` cases | raw types, `Object` |
| Go | `type UserID string` | interface with an unexported marker method | `any` |
| Rust | `struct UserId(String);` | `enum` with data | `dyn Any`, `transmute` |
| Python | `UserId = NewType("UserId", str)` | dataclasses tagged with `Literal`, joined in a union, read with `match` | `Any`, `cast()`, missing hints |
| JavaScript | JSDoc `/** @typedef {string & { __brand: 'UserId' }} UserId */` | JSDoc `@typedef` union | untyped parameters |

Capability tokens are ordinary types and work the same way in each language.

In Python and JavaScript, the rules in this section hold only if a type checker runs in CI: mypy or
pyright for Python; TypeScript with `checkJs` or `// @ts-check` for JavaScript. Without
one, nothing enforces them. Validate at runtime boundaries instead (wrapper classes,
pydantic, Zod), and rely more on the doc comments in section 3. Place that validation and
its error handling per [Boundary Discipline](../principle-boundary-discipline/SKILL.md).

## 3. Say it where the search lands

- **One-line doc comment on every export**, stating the sharpest constraint the code
  itself can't show (units, timezone, "source time, not insert time", ownership).
  The definition is where a name search lands; that line is your whole message.
- **Write the plain-words phrase in the doc comment.** Searches arrive as natural language
  ("rate limit", "retry delay"), and camelCase identifiers don't match phrase greps —
  `RateLimiter` is invisible to a search for "rate limit". The doc comment above each
  export should contain, in ordinary spaced-out words, the phrase someone would search
  for: a `SessionExpiryChecker` should say `/** Checks whether the user session has
  expired. */` so that a grep for "session expired" or "session has expired" lands here.
- **A module should make sense with its imports unread.** Each imported name plus its
  doc line should say enough that the reader never has to open the source module. If
  they do, the import's name is failing, not the reader.
- **Keep strings whole.** Never build event names, flags, or error codes with string
  interpolation (`` `github.${entity}.${action}` `` makes `github.pr.merged` unsearchable).
  Write the full literal even when a loop feels DRYer. The same applies to names looked
  up at runtime: `getattr(obj, f"handle_{event}")` and `` handlers[`on${event}`] `` hide
  the function names from search.
- **Error messages start with a unique literal prefix**, so a message seen in a log greps
  straight back to the throw site. ``throw new Error(`Webhook signature mismatch for ${id}`)``,
  never ``throw new Error(`${prefix}: mismatch`)``.
- **One searchable concept per file, and keep orchestrators thin.** The code that answers
  "where is X done?" should live in a module named after X — the thing a reader would
  ask about, not the mechanism inside — not inline in a coordinator,
  pipeline, or service class. An orchestrator should read as a sequence of calls into
  well-named modules; if a reader lands in it from a search, every line should point them
  one hop from the real implementation. Burying the implementation of several concepts in
  one large file makes every search for any of them land on the same wall of code.
  Split until each question-sized concept has one named home, then stop: a helper
  meaningful only inside one concept belongs inline, and a file per tiny function
  fragments one answer across several reads. The test runs both ways: a module that
  answers many unrelated questions is holding more than one concept.
- **Colocate tests** (`foo.test.ts` next to `foo.ts`, `foo_test.go` next to `foo.go`) so
  one search finds behavior and its specification together. Where the build tool requires
  a separate test tree, such as Maven's `src/test`, mirror the source path and name the
  test after the source (`FooTest.java`).
- **Mark dead ends.** Deprecate the old path, with a pointer to the new one:
  `@deprecated` (JSDoc), `@Deprecated` (Java), `// Deprecated:` (Go), `#[deprecated]` (Rust),
  `@warnings.deprecated` (Python 3.13+).

## Quick checklist before committing

1. Would one search for each new exported name be enough to find its implementation?
2. Would swapping two arguments of the new function fail the build (or the type check)?
3. Is the one thing a caller must know but the signature can't say (units, timezone,
   ownership, ordering) written right at the definition?
4. Do all log/error strings exist verbatim in the source?
5. Did anything change behavior without changing its name?
6. When code moved, is it gone from where it came from?
