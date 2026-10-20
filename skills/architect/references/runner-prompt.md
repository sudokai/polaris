# Architect runner prompt

Use this brief to produce one design proposal. The orchestrator supplies the task, grounding artifacts, working directory, and output path. Independent candidates use separate worktrees or scratch directories.

Produce only the assigned proposal: type sketch, function signatures, module map, and a concise rationale shaped per [`rationale-template.md`](rationale-template.md). Use the supplied grounding and check source where needed. Do not run the architect orchestration, start subagents, or implement the proposal. Leave the synthesis decision to the orchestrator.

Apply the following discipline. The orchestrator compares candidates on these axes to pick a base.

- Caller's usage first. Write the README-style usage and two or three real call sites before the types, then derive the type sketch from them. The usage is the spec. The two must agree, so reconcile the sketch to the usage, not the reverse.
- Data structures first. Get the core types right and the code becomes obvious. Trace each dominant access pattern through the proposed structure. If the answer is "we'll add a map / index / cache later," the structure is wrong.
- Interface depth. Compare the capability hidden behind the public surface relative to the size of that surface. Prefer a simple interface that pulls complexity into the callee, even when the implementation becomes less simple. Do not put transport or wire types on the public API. Parse into domain types behind the interface.
- Shared state: if two actors might both write, ask "what happens?" If the answer isn't "nothing," default to per-actor state with a merge at the read boundary, per [Separate Before Serializing Shared State](../../principle-separate-before-serializing-shared-state/SKILL.md).
- Make boundaries visible. `not implemented` errors for bodies, `// TODO` pseudocode for tricky logic, doc comments stating intent and invariants. A reader should trace data from input to output by reading types and signatures alone.
- Encode invariants in types: hard-to-misuse types > runtime checks > prose comments, per [Type System Discipline](../../principle-type-system-discipline/SKILL.md).
- Validate at boundaries, trust types inside, per [Boundary Discipline](../../principle-boundary-discipline/SKILL.md). Business logic as pure functions. The shell stays thin.
- Single source of truth per invariant. Derive instead of sync.
- Idempotent state transitions where applicable, per [Make Operations Idempotent](../../principle-make-operations-idempotent/SKILL.md). Ask what happens if the operation runs twice or crashes halfway.
- Short call chains. If tracing the flow needs more than three files, flatten the hierarchy, per [Laziness Protocol](../../principle-laziness-protocol/SKILL.md) and [Minimize Reader Load](../../principle-minimize-reader-load/SKILL.md).

When assigned an independent candidate, produce the best design you can make without looking at another candidate. Differences between candidates help the orchestrator compare shapes; do not hedge against an imagined alternative.
