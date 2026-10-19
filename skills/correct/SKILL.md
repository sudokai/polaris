---
name: correct
description: "Find the mistakes agents keep repeating in this repo and make each one impossible. Try architecture first, then types, then a lint whose error names the fix, then a test, and write docs last. Prove each check fails on a real past mistake. Repeat this each time the user corrects you, and when `reflect` hands over repo-side findings. Use for /correct."
disable-model-invocation: true
---

# Correct

The user keeps correcting agents in this repo for the same mistakes. Change the repo so the next agent can't make them.

Assume every contributor is an agent that sees only the files it opened, copies the nearest example, and takes the shortest path that compiles. Design the repo so a change that looks right from one file is right for the whole repo.

## Find the mistake classes

Start from one of two inputs:

- **Findings handed over by the `reflect` skill** (`../reflect/SKILL.md`). Each one comes with evidence and a level that the user approved: usually a rule row for a first occurrence, and a structural fix for a repeat. Before you add a rule row, check the rule table and `.agents/polaris/backlog.md` for an earlier occurrence of the same mistake. If you find one, the finding is a repeat, so fix it structurally. Otherwise, build it at the approved level. If that level can't prevent the mistake, go higher and say why.
- **Your own scan.** Read `.agents/polaris/backlog.md` first, if it exists. Then read recent commits, reverts, review comments, agent instruction files, and comments that explain workarounds. Group the mistakes into classes. A class counts once it has happened twice.

Before adding any check, read the repo's own check command (the `lint` and `check` scripts in `package.json` or the build tool) and its CI workflow. A check that exists but is not wired into a hook or CI is the finding: wire it in instead of writing a new one. A repo with no pre-commit hook and no CI job running its checks is a finding too.

## Fix each class at the highest level that works

1. **Eliminate it with architecture.** Give each piece of state one owner and each task one supported way. Hide internals so the wrong import fails. Replace hand-synced lists with one source of truth. Delete old ways and dead code an agent would copy.
2. **Enforce it with types so the bad state can't be written.** If bad code still compiles, add a lint or CI check whose error names the file, type, or function to use instead. If the pattern is already common, fail only when a change adds more.
3. **Test the behavior.** Fix or delete any test that would still pass if every function it calls returned nothing.
4. **Write docs, agent rules, or navigation pointers last, only for judgment calls and hard-to-find files.** Nothing fails when an agent skips them.

## Fix and prove

Then fix the most frequent classes now, one commit each. Prove each new check fails on a real past mistake. Run the same command locally and in CI. Exceptions go on the offending line with a reason, an expiry date, and a human's approval.

When the user approves a fix but chooses not to do it now, append it to `.agents/polaris/backlog.md` in the project root, and commit the file. Each entry has the date, the mistake, the evidence (a transcript or a commit), and the suggested fix and level. Remove an entry in the same commit that ships its fix.

## Keep the rule table

Last, keep a table in the repo's agent instruction file (not the user's personal one) that pairs each rule with what enforces it. When the user corrects you, fix the mistake and add the rule. If the rule was already there and nothing enforces it, that's a repeat, so fix it at the highest level in the same change. Each time you add a row, drop the rows whose mistake can no longer happen, so the table does not only grow.

**Reply:** each class with its evidence, the level you picked, and why a higher level didn't work, plus any entries added to or removed from `.agents/polaris/backlog.md`.
