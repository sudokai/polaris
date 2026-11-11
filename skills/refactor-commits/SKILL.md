---
name: refactor-commits
description: Refactor committed and uncommitted changes since the merge base into logical, easy-to-review local commits without changing the final tree. Use for "clean up commits", "split this into reviewable commits", or "tidy my branch history". Never pushes.
disable-model-invocation: true
---

# Refactor Commits

Refactor all committed and uncommitted changes since the merge base into logical, easy-to-review commits. Inspect the complete diff first, then reorder, split, squash, and edit commits as needed. Preserve the final tree and behavior. Do not push.

## Safeguards

Before rewriting:

1. Create a backup branch at the current tip.

   ```bash
   git branch backup/refactor-commits-$(date +%Y%m%d-%H%M%S)
   ```

2. Record the tree of the full working tree, including uncommitted and untracked files.

   ```bash
   TMP_INDEX=$(mktemp -u)
   EXPECTED_TREE=$(GIT_INDEX_FILE=$TMP_INDEX git add -A && GIT_INDEX_FILE=$TMP_INDEX git write-tree)
   rm -f "$TMP_INDEX"
   ```

After rewriting, confirm the final tree matches:

```bash
test "$(git rev-parse HEAD^{tree})" = "$EXPECTED_TREE" && echo identical
```

If it differs, fix the history or restore from the backup branch.
