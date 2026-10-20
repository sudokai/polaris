---
name: sync-pstack
description: "Port new pstack changes into polaris: list the pstack commits after the last synced commit in docs/upstream-sync.md, compare each change against polaris, port the approved ones, and move the last synced commit forward. Use for /sync-pstack, or when the user asks what polaris can bring over from pstack."
disable-model-invocation: true
---

# Sync pstack

polaris ports changes from pstack by hand. `docs/upstream-sync.md` records the last pstack commit that was reviewed, and the changes skipped on purpose. This skill reviews every pstack commit after that one, ports the changes the user approves, and moves the record forward. When it finishes, rerunning it finds nothing new.

## 1. List new commits

Get a current checkout of `cursor/plugins` with the `librarian` skill, and search `origin/main`, not the working tree. Read the last synced commit from `docs/upstream-sync.md`, then run:

```sh
git log --oneline <last synced>..origin/main -- pstack
git diff --stat <last synced> origin/main -- pstack
```

If no commits are listed, say so and stop.

## 2. Compare against polaris

Read each commit's message and its diff. For each changed pstack file, find its polaris counterpart. Many skills keep their names. Renamed ones include `poteto-help` → `polaris-help`, `poteto-mode` → `polaris`, `setup-pstack` → `setup-polaris`, and `in-your-own-words` → `restate-my-intent`. If a name gives no match, search polaris for the changed sentences.

Diff the pstack file at `origin/main` against the polaris file. A change can already be in polaris from an earlier port, so judge each one by what polaris says now, not by the commit. Sort every change into one of these:

- **Already in polaris.** The polaris text already says it, perhaps in polaris's own words.
- **Port.** It improves a skill, principle, or playbook that polaris has.
- **Skip.** It has no polaris counterpart: version bumps, Cursor-only features, pstack's install steps, or the Cursor guide under `pstack/docs/guide/`. Guide changes can still carry a fact that belongs in `polaris-help`, so check them first.

## 3. Propose

Show the user a table: the pstack commit, the change, its polaris counterpart, the category, and for **Port**, what polaris would change. Note any port that reverses how a polaris skill behaves. Those need an ADR in `docs/adr/` that says why, per the `domain-modeling` skill.

Ask which ports to apply. Apply nothing before the user answers. For each port the user rejects, ask whether to record it under Skipped, with the reason.

## 4. Apply

1. Port each approved change in polaris's terms: polaris's skill names, its harness-neutral wording (no Cursor-only features), and the `write-clearly` skill. Adapt the change to polaris's text; do not paste pstack's text over polaris's own edits.
2. Update every place that describes a ported skill, such as the tables and recipes in `polaris-help`.
3. Write any ADRs and add them to the list in `docs/README.md`.
4. In `docs/upstream-sync.md`, set the last synced commit to the newest commit you reviewed, with its date and subject, and add the skipped changes and their reasons. Move it forward only past commits whose every change is ported, already in polaris, or recorded as skipped. Otherwise the next run would miss the open ones.
5. Run `python3 scripts/check_plugin.py`.

Report what you ported, what you skipped and why, and the new last synced commit.
