# Code and repository history

Repository history anchors a question in actual code changes. It may not preserve the author's reason. Follow requirement and discussion links when commit messages do not explain the decision.

## Locate the change

```bash
# Locate the commits responsible for the current lines
git blame -L <start>,<end> <file>

# Inspect recent changes and history through a rename
git log --oneline -20 -- <file>
git log --follow --oneline -- <file>

# Find commits that added or removed exact text or a matching pattern
git log -S '<exact_string_from_code>' -- <file>
git log -G '<regex>' -- <file>

# Read a commit or the changes between two revisions
git show <hash>
git log <old>..<new> -p -- <file>
```

## Find associated evidence

Use the available repository, review, and issue tools to inspect:

- The complete diff, commit message, and linked PR
- Review discussions, requested changes, and linked issues
- Nearby comments, `TODO` and `FIXME` notes, and decision records
- Tests added or changed with the target
- Other files changed in the same commit
- Release notes and changelog entries

These searches can locate related records:

```bash
rg -l -i 'architecture.decision' --glob '*.md'
rg -n -C2 '(TODO|FIXME|HACK|XXX|NOTE)' <target_file>
rg -l '<symbol>' --glob '*test*'
```

Read the cited source rather than drawing a conclusion from its title. Record the commit hash, PR or issue identifier, document link, or file and line range needed to verify each finding.
