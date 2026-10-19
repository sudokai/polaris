# walkthrough is folded into polaris, and shares architect's red flags

polaris now ships the user's `walkthrough` skill, which explains a PR, a branch, a commit, or a diff in stages and ends with a quiz. It already drew with the `show-me` views, which polaris owns (ADR 0014). It explores the existing system with `how`, and starts on its own under ADR 0013, because it only reads and `how` starts no helper agents for an ordinary change.

`architect/references/design-red-flags.md` is the one list of design red flags. `architect`'s judge screens each candidate against it, and `walkthrough` flags the same problems in the code it explains. `walkthrough`'s own lists cover correctness and changes that need a person's attention.

## Considered options

- **Keep a separate red-flag list in `walkthrough`.** Rejected because the two lists overlapped in four flags and would drift apart.
- **Rename the pagination example to avoid the word "cursor".** Rejected because a pagination cursor is the standard term. The check flags only the capitalized name and the `.cursor` directory as the Cursor harness.
