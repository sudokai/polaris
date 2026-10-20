# Cheap standalone skills start on their own

This decision replaces ADR 0003. An agent can start a bundled skill on its own when the skill meets all three conditions:

1. It is useful without the router.
2. It is cheap: it starts no fan-out of subagents and writes nothing beyond the task.
3. The user wants it in sessions that did not start with `/polaris`.

Fourteen skills meet them: `prove-it`, `diagnose`, `fix-change-detector-tests`, `decision-log`, `prototype`, `restate-my-intent`, and `ketchup`, plus `discuss`, `define-domain-language`, `tdd`, `write-discoverable-code`, `deslop`, and `sweep-residue` from ADR 0014, and `walkthrough` from ADR 0015. Each has no `disable-model-invocation` and no `agents/openai.yaml`. Every other skill except the router stays hidden as ADR 0003 describes. `AGENT_INVOCABLE_SKILLS` in `scripts/check_plugin.py` lists them and fails the check when a skill's switches disagree with the list.

## Consequences

- Fourteen descriptions sit in every session's skill list. Thirteen of them replace global skills that were already there, so the net cost is about one description.
- The user's instruction file can name these skills, and the name resolves to the polaris copy.
- Inside polaris, router triggers still route to these skills. Their descriptions matter only outside the router.
- A missed trigger for one of these skills is fixed in its description. For a hidden skill, it is still fixed with a trigger line.

## Considered options

- **Keep every task skill hidden (ADR 0003).** Rejected because the folded skills were invocable before, and the user's instruction file relies on that.
- **Make `recall` invocable.** Rejected because it starts several subagents.
