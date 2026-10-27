# Resume selection uses task identity

Session pickup selects a resume note by explicit path first, then by matching task or branch and worktree among unfinished notes. If several notes match, it asks the user which to resume. Recency alone was rejected because the newest note can belong to an unrelated task.

Resume notes carry structured task identity and completion status so selection does not depend on interpreting prose. Finished notes cannot be selected as unfinished work. Notes belong to the current worktree and remain personal and uncommitted.

The matching procedure and note format live in [session pickup](../../skills/polaris/playbooks/session-pickup.md) and [pause safely](../../skills/polaris/playbooks/pause-safely.md).
