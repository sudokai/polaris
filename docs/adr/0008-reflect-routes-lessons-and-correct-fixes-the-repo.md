# `reflect` routes lessons, and `correct` fixes the repo

The reviewer counts and synthesis placement below describe the original decision. The [current skill](../../skills/reflect/SKILL.md) scales them to the session; its routing and approval rules retain this split.

The learning skills split by what they change. `reflect` finds lessons and routes each one to a destination. `correct` builds repo-side fixes: architecture, types, lints, tests, and docs. Whether the evidence comes from one session or many is a mode setting inside `reflect`, not a reason for a separate skill, so the former history skill `automate-me` became `reflect`'s history mode.

## Decisions within this split

- **Session mode and history mode share one synthesizer on the `ultra` role,** so both have one output format and one approval flow. Only three things differ by mode: how evidence is gathered, the confirmation questions, and the synthesizer's filter. Each lives under a labeled heading, so an agent cannot apply one mode's rule in the other.
- **Session mode is deep and narrow; history mode is broad and shallow.** Session mode runs three reviewers on one transcript, two on `deep`, to find the lesson one incident teaches. History mode splits weeks of transcripts across three `standard` miners, because finding repetition needs coverage more than depth.
- **Session mode keeps three reviewers.** The environment reviewer took over the repo-setup checks from mattpocock's `retro` instead of a fourth reviewer, which would repeat its work and add a subagent to every run.
- **Session mode drops findings about skills the session never read or edited.** History mode keeps a pattern only if it appears at least twice, and treats a preference that the user contradicted as noise. The session rule would discard most "no skill covers this yet" patterns in history mode.
- **Structural findings go to `correct` in the same session, not to a backlog.** A backlog collects items that never get built. The backlog holds only fixes that the user approved and chose to defer.
- **A first occurrence adds a rule row; a repeat gets a structural fix.** The synthesizer proposes the level, and the user can raise it during approval.

## Considered options

- **`retro`'s review-time split**, which keeps judgment rules in a file that only a review agent reads. Rejected: polaris has no review step, so nobody would read that file. Reconsider it if polaris gains a review step.
