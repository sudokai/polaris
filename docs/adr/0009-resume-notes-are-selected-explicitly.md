# Resume notes are selected explicitly, never by recency

Session pickup selects a resume note by an explicit path first, then by matching task, or branch and worktree, among notes whose `status` is not `done`. If several notes match, it asks the user which to resume. The newest note is often a different task, so recency alone would resume the wrong work. Each note starts with header fields (task, branch, absolute worktree, updated time, and status) so that matching does not depend on reading prose. A finished task sets `status: done` so no later pickup selects it.
