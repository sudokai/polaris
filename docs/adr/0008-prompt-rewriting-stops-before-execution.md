# Prompt rewriting stops before execution

`sharpen` returns a rewritten prompt without performing the task. The user can inspect and change the framing before submitting it for execution. Combining rewriting and execution hides the framing until after the agent acts.

Showing the framing and then executing in the same turn was also rejected because it still gives the user no opportunity to intervene. Prompt rewriting is a complete requested outcome, not an implicit authorization to do the rewritten task.

The rewriting method lives in [sharpen](../../skills/sharpen/SKILL.md).
