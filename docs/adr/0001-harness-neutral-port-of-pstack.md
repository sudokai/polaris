# polaris is a harness-neutral port of part of pstack

polaris ports the router, all 24 principles, two playbooks, and 11 skills from pstack (`cursor/plugins/pstack`, MIT, by Lauren Tan), and drops pstack's Cursor- and Grok-specific content. We kept pstack's architecture, a router that indexes principles and playbooks and routes work to skills, because it already worked. We dropped everything tied to one harness so that the same files install in every supported harness. Harness-specific facts live only in the two harness fact files (`skills/polaris/references/models.md` and `skills/polaris/references/harnesses.md`) and in each harness's install manifest. `scripts/check_plugin.py` rejects harness terms anywhere else in `skills/`, so the rule is enforced rather than reviewed.

## Consequences

- Every skill polaris uses is copied into the plugin. polaris does not depend on skills installed elsewhere.
- `LICENSE` keeps pstack's MIT notice for the ported files.
- The router has no reply style. pstack's style rules were one person's taste, and the user sets reply style in their own instruction file.
- Ported skills changed where they depended on skills polaris does not ship:
  - `architect` replaces `arena` with two `deep` sketchers and an `ultra` judge that wrote neither sketch.
  - `why` keeps its general method and drops the vendor-specific source guides. The agent discovers which sources the session has.
  - `prove-it` replaces the user's `verify-this`. It is named to pair with the Prove It Works principle, and it absorbs pstack's `benchmark-checklist` as `references/measured-numbers.md`.
  - `unslop` is not ported, because it targets human-facing prose and polaris writes agent-facing prose.
- When pstack changes upstream, port only files polaris imported, and keep polaris's adaptations where upstream rewrote the same sentence. Do not copy pstack's version numbers or model slugs.
