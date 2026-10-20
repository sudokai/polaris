# Writing skills and plan finalization

polaris imports `technical-writing` and `unslop` from pstack, naming the latter `deslop-language` to distinguish prose editing from the code-focused `deslop`. `technical-writing` owns document structure and style and calls `deslop-language` for AI writing patterns.

Both writing skills start on their own under [ADR 0013](0013-cheap-standalone-skills-start-on-their-own.md). Each is useful without `/polaris`, starts no helper agents, and edits only the requested prose. The user wants both available outside router sessions. Their invocation metadata and `AGENT_INVOCABLE_SKILLS` reflect that choice.

`finalize-plan` comes from the user's skillset. It turns a settled design into a standalone implementation plan with rationale, ordered steps, acceptance criteria, and the files needed to rebuild context. It preserves existing plans by choosing an unused filename unless replacement is explicitly requested. It stays explicit-only, preserving its existing invocation setting and requiring a request for the saved artifact.

Under [ADR 0021](0021-playbooks-own-task-delivery.md), the caller or playbook sequences design and plan finalization when both are requested. `architect` produces a complete design. `finalize-plan` accepts a settled design from any source. Neither calls the other. Missing design decisions return to the caller; plan finalization does not redesign or implement the solution. `discuss` continues to settle decisions and summarize them without automatically saving a plan.

`visual-pr` uses `technical-writing` without Diátaxis and preserves its PR template. `finalize-plan` and `figure-it-out` use it while preserving their plan and playbook formats. These references share writing methods without assigning workflow coordination to the skills.

## Considered options

- **Keep both writing skills hidden as upstream does.** Rejected because they meet ADR 0013's criteria for standalone use.
- **Make `finalize-plan` agent-invocable too.** Deferred. The import preserves explicit invocation; saving an artifact remains a separate requested outcome.
- **Make `architect` call `finalize-plan`, or require `finalize-plan` to call `architect`.** Rejected because either skill can serve a complete request independently. Their caller owns the sequence.
