# Eight more of the user's global skills are folded into polaris

polaris now ships `discuss`, `domain-modeling`, `deslop`, `sweep-residue`, `tdd`, `write-discoverable-code`, `show-me`, and `visual-pr` from the user's global skill directory. The user's instruction file names most of them, and each one overlaps a polaris skill or principle, so keeping both copies meant rules that drift apart, as in ADR 0012. After the fold, the global copies are deleted.

- Each skill keeps one copy of each rule. `deslop` points to `fix-change-detector-tests` instead of repeating it. `tdd` points to Test Behavior, Not Implementation, for what a good test asserts, and has no examples file of its own. `visual-pr` reads `show-me` instead of keeping its own copy.
- `show-me` is the one set of views that `architect`, `ketchup`, and `visual-pr` draw from.
- Never Block on the Human holds the five-step rule for who makes a call. `tdd` decides internal interfaces itself instead of asking for approval, and `discuss` asks only the questions that are the user's to answer.
- polaris names its glossary `GLOSSARY.md`, the file `domain-modeling` writes.
- `visual-pr` writes the PR body to a temporary file and keeps no saved copy. How to show an HTML file is a harness fact, so it lives in `harnesses.md`.

Six of the eight start on their own under ADR 0013: `discuss`, `domain-modeling`, `tdd`, `write-discoverable-code`, `deslop`, and `sweep-residue`. `show-me` stays hidden, as it was. `visual-pr` stays hidden because it pushes a branch and opens a PR.

## Considered options

- **Merge `deslop` and `sweep-residue`.** Rejected because they do different jobs: one simplifies the design, the other removes conversation leftovers from code and docs.
- **Make `write-discoverable-code` a principle.** Rejected because a principle is a short rule for one decision, and this is a set of rules across languages that the user's instruction file names as a skill.
- **Merge `discuss` into `sharpen`.** Rejected because `sharpen` frames a task and then does it without asking, while `discuss` asks over several rounds and stops before any code.
- **Render every diagram with pele in harnesses that do not render Mermaid.** Rejected because it opens a browser tab for most replies and installs a new package at reply time. `harnesses.md` lists which harnesses render Mermaid, the rest get plain text, and only `show-me`'s HTML page draws Mermaid with pele.
- **Fold `make-pr-easy-to-review` too.** Deferred. Its main job is cleaning commit history, which `visual-pr` does not do.
