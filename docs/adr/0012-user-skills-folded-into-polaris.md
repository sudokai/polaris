# Some of the user's global skills are folded into polaris

polaris now ships seven skills that came from the user's global skill directory or that replace one there: `speak-human`, `restate-my-intent`, `fix-change-detector-tests`, `diagnose`, `prototype`, `decision-log`, and `prove-it`. Each one duplicated or extended something polaris already had, so keeping both copies meant two versions of one rule that drift apart. After the fold, the global copies are deleted.

- `decision-log` is `show-me-your-work` renamed, with the user's `implement-with-notes` merged in. It has a light level for every planned implementation and a full level, with the transcript audit and a cross-model review, for unattended and `figure-it-out` runs. A `kind` column separates a decision from a deviation from the plan.
- `prototype` runs only when a person must make the call. When the agent can make the call by running something, it writes the smallest script instead.
- The driving rules from the user's `control-cli` and `control-ui` skills go into `create-verification-skill`, so every generated verification skill carries them. The rest of those skills is generic harness code that a current model writes without help.
- `diagnose` hands an architecture finding to `correct`, because polaris does not ship `improve-codebase-architecture`.

The same change ports pstack's later work: four principles restated as reasoning, its token cuts, the formal verification pair, `sharpen`, `ketchup`, and `poteto-help` as `polaris-help`.

## Considered options

- **Keep the global skills and point polaris at them.** Rejected because polaris does not depend on skills installed elsewhere (ADR 0001).
- **Move `control-cli` and `control-ui` in as reference files.** Rejected because about 80% of their text is code a model writes unaided. Six rules carry the value.
- **Keep `implement-with-notes` and `show-me-your-work` as separate skills.** Rejected because both log decisions during implementation, at different sizes.
