---
name: recall
description: "Reconstruct your recent working context from your own chat history, live state, and the shared record (user reports, prior fixes, incidents), then hand back a tight current-state brief. Use for 'recall my work on X', 'catch me up', 'what have I been working on', 'where did I leave off', before starting or resuming work."
disable-model-invocation: true
---

# Recall

**Before you start or resume work, you rebuild the user's recent working context and hand back a tight capsule of where things stand now and what to do next.**

Keep it tight and on-topic. Read only what the in-scope threads need, then stop.

Your own chat history holds what you did and decided. The shared record holds user reports, prior fixes, incidents, and decisions under other names. Start with relevant transcripts, linked artifacts, and current state. Expand into the shared record when they leave a concrete gap or conflict, especially for a feature with unresolved symptoms or reverted fixes.

Find transcripts with `../polaris/references/harnesses.md`.

1. Classify, then route. One specific prior chat to resume is the `polaris` skill's Session pickup playbook, not this. Turning habits into playbooks or skills is the `reflect` skill (`../reflect/SKILL.md`) in history mode. A human-readable summary of your work is a different task. Recall loads working context across recent chats before you act. If the user already gave you a full state capsule (paths, branch, the change), use it and skip the mining.
2. Lock the scope before searching. Pin the window ("recent" is a real range, default the last 7 days), the topic if named, and the workspace (default the active one. Never read another project's transcripts without being asked). State the scope back. Never quietly turn "all" into "recent N".
3. Filter chat history before delegating. Order candidates by real modification time (`ls -t`), grep the topic, and read matching regions. Skip the current chat plus obvious noise (subagent, eval, and test chats). Read a small set directly. For bulk reading, split matching transcripts into non-overlapping slices for `fast` subagents (see `../polaris/references/models.md`); they do not start more agents. Each returns concise findings: topic, the user's goal, decisions, open threads, struggles and corrections, and artifacts, citing the chat UUID. Keep raw transcripts out of the main context.
4. Follow linked PRs, tickets, design documents, chat threads, or error reports that bear on the current state. Reuse evidence already gathered. For unresolved symptoms, missing decisions, or conflicting history, use the `why` skill (`../why/SKILL.md`)'s progressive search with the question "what's the current state, what's been tried and didn't hold, and what are users still reporting?" Search a relevant source even without a link when it could resolve a concrete gap. A named feature alone does not require searching every system. If the user requests a comprehensive investigation, use `why`'s comprehensive coverage rule.
5. Verify against live state. Take the PRs, branches, and tickets that the mining and the sweep surfaced and check them with `git` and `gh`. When the answer hinges on what an agent actually did (the tools it ran, files it read, errors it hit), read the full transcript, not just a trimmed local copy.
6. Write the brief to the contract below. Group by thread. Stay on the named topic.

## Output contract

Lead with the capsule, then the thread status, then the problems, then the next move. Deeper detail goes below or gets cut.

- **Capsule.** At most 5 bullets. What this work is and where it stands overall.
- **Threads.** One line each, prefixed with exactly one status tag: `[merged #N]`, `[open PR #N]`, `[in flight <branch>]`, `[verified, uncommitted]`, `[reverted #N]`, or `[planned, not started]`. A thread with no tag is not done yet, so tag it.
- **Problems.** At most 5, the recurring ones. Include the symptoms users keep reporting and any fix that shipped and was reverted, so the next attempt starts where the last one failed.
- **Next move.** The single most useful next action, concrete.
- **Coverage.** Briefly name the records searched, material sources unavailable or left unsearched, and unresolved gaps. Do not present a partial search as the complete shared record.

An adjacent feature or ticket stays out unless it blocks this one. When the capsule and thread lines outgrow a screen, cut detail before you cut threads. Cite chat findings by UUID and shared-record findings by their source (PR #, ticket ID, chat permalink, error-tracker issue), and sanitize private context before any public output.

**Reply:** the brief, to the contract above.
