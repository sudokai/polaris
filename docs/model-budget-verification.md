# Model budget verification

Historical verification of the initial model-budget implementation on October 19, 2026, before the assignment kind and level refinement. The current decision is [model allocation by assignment and budget](adr/0003-model-allocation-by-assignment-and-budget.md). The results below apply to that earlier policy. This record separates instruction behavior, structural validity, accepted model requests, and actual child execution. It does not establish production cost savings.

## Structural and instruction checks

- `python3 scripts/check_plugin.py` passes for profile coverage, supported allocation efforts, agent fields, Claude registrations, skill metadata, links, and harness-neutral instruction boundaries.
- `python3 -m unittest discover -s scripts -p '*_test.py'` passes 10 tests. Temporary fixtures demonstrate rejection of missing profile/category allocations, GLM low, GPT max, missing reasoning effort, undiscoverable Claude agents, and agents in the portable manifest. Wording-only changes remain valid.
- `claude plugin validate .`, `claude plugin validate .claude-plugin/plugin.json`, and `claude plugin validate com.anthropic.claude-code/agents` pass. These checks do not prove a child runs with the requested effort.
- One independent fresh-context reader resolved six scenarios from the shipped instructions: GPT medium assignments; layered pi configuration with a task-only budget and fixed override; Composer runtime fallback versus setup-selected Grok-only operation; rejected Astra/Sol without cross-provider authorization; unavailable visual GLM Flash; and unchanged Hermes delegation. It also checked newer Claude per-spawn controls. The reader used inherited model/effort, no conversation fork, no external services, no file edits, and no further delegation. This validates interpretation, not real account access.

The generic skill-creator validator rejects `disable-model-invocation` in both the previous committed setup skill and the updated skill. This is a pre-existing schema mismatch; the repository validator checks this invocation policy explicitly.

## Small model comparisons

Baseline and budget requests used the same input within each comparison through `codex exec --ignore-user-config --skip-git-repo-check --ephemeral --sandbox read-only --json`, with explicit `-m` and `model_reasoning_effort`. Baseline pair choices come from the previous role table; verification uses Sol high as a shared control. These are isolated pair checks, not full workflow benchmarks or proof that every task was classified optimally.

| Assignment | Baseline request | Budget request | Result | Reported output tokens, baseline / budget |
| --- | --- | --- | --- | --- |
| Bounded Python implementation | Luna xhigh | Sol low | Both returned executable code passing trimming, case-insensitive deduplication, empty-input, and invalid-type checks. No correction pass. | 359 / 142 |
| Seeded correctness review | Sol medium | Sol high | Both found rejection of nonpositive amounts and mutation before insufficient-funds rejection. No missed seeded defect or correction pass. This small review alone does not justify the substantial-reasoning classification. | 221 / 301 |
| Execute verification fixture | Sol high | Sol high | Both actually ran the same Python fixture, returned exit 0, and reported all four checks true. No correction pass. | 95 / 182 |

The verification comparison executed the fixture through the terminal tool; an earlier case-interpretation-only probe is excluded. Generated implementation code was separately executed against the stated checks. Review findings were checked against the seeded requirements.

### Estimated API cost

Standard API rates checked on October 19, 2026, in the official [GPT-6.1 Sol model documentation](https://developers.openai.com/api/docs/models/gpt-6.1-sol) and [GPT-6 Luna model documentation](https://developers.openai.com/api/docs/models/gpt-6-luna):

| Model | Input / million | Cached input / million | Output / million |
| --- | --- | --- | --- |
| GPT-6.1 Sol | $2.00 | $0.10 | $10.00 |
| GPT-6 Luna | $0.10 | $0.01 | $0.50 |

Estimate each run as `((input_tokens - cached_input_tokens) × input_rate + cached_input_tokens × cached_rate + output_tokens × output_rate) / 1,000,000`. All recorded cache-write counts are zero. Reported output tokens include reasoning; do not add reasoning tokens again. These are standard API-equivalent estimates, without Fast/regional premiums, rather than measured subscription allowance charges or invoices.

| Assignment | Baseline estimate | Budget estimate | Change |
| --- | --- | --- | --- |
| Bounded Python implementation | $0.000831 | $0.013481 | 16.22× cost |
| Seeded correctness review | $0.014331 | $0.015131 | +5.6% |
| Execute verification fixture | $0.016857 | $0.017833 | +5.8% |
| Total | $0.032020 | $0.046446 | +45.1% |

**Sample cost result: higher estimated cost.** The main increase comes from replacing Luna xhigh with Sol low. Fewer output tokens did not offset Sol's higher rates. Both implementations passed the small checks, so this sample does not establish a quality advantage that would justify that increase.

**General savings result: INCONCLUSIVE.** There is one sample per pair; input sizes, cache hits, and tokenization differ. The unchanged verification pair also varied. The Codex output does not independently identify the backend model, and these small cases do not establish full-workflow quality or correction rates. A claim of lower overall cost needs repeated representative tasks; published prices are sufficient to estimate these individual samples.

The raw responses, prompts, generated functions, fixture, and usage records for this run are in `/tmp/polaris-budget-evaluation/`. They are local working evidence, not required plugin runtime files.

## Harness checks and limitations

- **Claude Code 2.1.303:** a harmless request using `--plugin-dir <repo> --agent polaris:sonnet-medium --tools ''` returned READY. `modelUsage` identified `claude-sonnet-5-5`. A subsequent actual child-spawn smoke test returned `No messages returned from query`; successful child spawning and effective child effort remain unverified. Current documentation supports per-invocation effort when the session exposes it.
- **Grok Build 1.0.62:** a definition-only Composer probe returned READY but reported `grok-4.7-build`, so it is not a Composer pass. An explicit `-m grok-composer-2.5-fast` request failed with `unknown model id`. Do not ship that ID as an assumed Grok Build definition. Setup must confirm the route-specific ID before generating one. A two-child smoke test exposed no usable spawn tool with the supplied CLI filter and reached its bounded turn limit; actual Grok child selection/effort remains unverified. This does not disprove Composer availability through other xAI routes.
- **Codex:** explicit Sol-low, Sol-medium/high, and Luna-xhigh requests completed; the verification requests executed the fixture. The app's per-spawn selection path and actual child metadata were not exercised by these CLI pair checks.
- **Cursor, pi, and DeepSeek Harness:** instructions and profile tables were checked; model selection in a running editor, pi extension, or DeepSeek session was not exercised. Required tool fields, access, speed tier, and effort must be confirmed in that session.
- **Hermes:** no personal configuration was changed and no separate-process delegation was introduced. Its configured delegation pair, otherwise the parent pair, remains in effect.

Installed plugin copies were not refreshed as part of source verification. In particular, Hermes installation copies committed source; an uncommitted source tree is not proof of an installed update.
