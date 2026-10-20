# `sharpen` returns a rewritten prompt and does not do the task

`sharpen` used to frame a task the way a top expert would, then do the work in the same turn. The user never saw the framing, so they could not correct it before the agent acted on it. pstack made the same change in cursor/plugins#729, restoring its original prompt and returning only the rewrite.

`sharpen` now asks four things: what a top professional would do that the user did not ask for, the rawest material they would start from, their methods and tools, and what outside check would show the result is right. It then rewrites the user's prompt to ask for exactly that and returns the rewrite. The user reads it, edits it if needed, and sends it, for example with `/polaris`.

## Considered options

- **Keep framing and doing in one turn.** Rejected: the framing is the part worth reviewing, and doing the work hides it.
- **Show the framing, then do the work.** Rejected: the agent still acts before the user can change the prompt, and the turn grows larger, not deeper.
