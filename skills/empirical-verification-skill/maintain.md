# Maintain a verification skill

A feature map goes stale when the app changes. Cover every feature from source, and drive every feature live. The unit of rigor is the feature, not every sentence.

## Outcome

Report one:

- **clean:** every feature got source and live coverage, and nothing needs changing. No branch and no PR.
- **changed:** one PR of proven corrections to the skill, its map, or its helpers.
- **blocked:** coverage could not finish, or a proven fix could not ship safely. Say what blocked it.

Edit only the verification skill's own folder. Never edit product code. A behavior the map describes and the app no longer has is either drift in the map, which you fix, or a product regression, which you report.

## Pass

1. **Index.** Check the feature map's README against the files beside it. Fix missing, extra, duplicate, or dead entries.
2. **Source.** Group feature files by shared implementation, so that each subsystem is read once. For a large map, give the groups to read-only subagents that never drive the app or edit files. For each feature, collect a summary, its source entry points, likely drift, and one recipe for driving it live. Look through recent changes for user-facing surfaces that the map lacks, and name a source path before you call one missing.
3. **Live.** Drive every feature at least once, even when the source looks clean. Merge overlapping recipes into as few app states as you can. You do all the driving, with the skill's own launch model. Hold these throughout:
   - Run doctor before the first drive, on each fresh session, and after any failed drive. When doctor cannot see the problem, such as a stuck UI on a healthy process, reset to a known state or relaunch.
   - Evidence captured so far survives every cleanup. Check it at its named location.
   - Clean up what each failed drive started, whether its session is stuck, exited, or shared. On a shared instance, clean up the residue, not the instance.

   A doctor failure caused by drift in the skill is drift: fix it and retry once, restarting only what the fix invalidated, before you call the pass blocked. Call a feature unreachable only with the concrete prerequisite, such as auth, an entitlement, an OS, or external state, and the route you tried. A prerequisite that the map omits is drift.
4. **Triage.** A wrong or missing description is drift: fix it. Working behavior that the harness cannot drive is a harness gap: fix it under the helpers rule in [create.md](create.md#2-write-the-skill). Broken app behavior is a product gap: report it, and keep it out of the PR. Drive every harness fix live again before it ships.
5. **Ship or stop.** Tear down after the last drive, keeping the evidence. For changed, reread every changed file, then open one PR. Report the outcome, the features covered, unreachable prerequisites, and confirmed drift.

Keep run notes in a scratch folder, and do not commit them.
