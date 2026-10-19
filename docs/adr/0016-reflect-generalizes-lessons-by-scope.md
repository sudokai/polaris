# `reflect` generalizes each lesson as far as its scope, and no further

`reflect`'s findings stayed tied to the incident that surfaced them. In one run, the synthesizer kept a fix for one skill ("don't overwrite `plan.md`") and rejected the general lesson ("a fixed output path destroys another task's file") as a duplicate of it. Each reviewer anchored its principle to the exact moment in the transcript, the merge kept the row with the most concrete edit, and the skill-was-used rule kept a lesson inside whichever skill happened to cause the incident.

The synthesizer now writes each finding at three levels: the incident, its mistake class, and the narrowest destination that covers the class. It moves the wording toward the class and stops before the lesson loses a trigger an agent notices, a concrete action, or evidence that agents get it wrong by default. Generalizing past that point produces platitudes that change nothing.

Scope sets how far a lesson must reach. A project lesson must hold across the project's tasks and may name its files and workflows, so project lessons sharpen toward how that project works. A user lesson must hold across kinds of work and names nothing from one repository.

## Decisions within this change

- **The Reach test names two other situations at the row's scope** where the exact wording changes what an agent does, and writes them in a Reach column. A lesson that fails it stays narrower or is rejected. The column makes the test visible, because a test that lives only in the synthesizer's reasoning gets skipped.
- **A finding from a used skill may route up** to a user-scope line or an upstream principle proposal, never sideways to a skill the session did not use.
- **One session can produce a user-scope lesson** about agent behavior, marked `user (seen in one project)` so the user can push it down. Waiting for history mode would repeat the mistake in the meantime.
- **A lesson found in two or more projects is promoted** to one user-scope line. `reflect` removes the copy in the current project and lists the others; it never edits other repositories. It finds them by reading other projects' instruction files only, never their transcripts.
- **Existing entries are refined before new ones are added,** and a target instruction file past 200 lines also gets proposals to remove or merge lines. Every agent loads these files.
- **From `retro`:** the synthesizer labels each Accepted row with a cost band and sorts by it, so the ordering can be checked. The top band, `[ships]`, is only for rows that add or wire an automated check or fix committed files; otherwise lessons about agent behavior crowd out gaps in the repo's checks. A check that exists but runs in no hook or CI is never already-covered, so it becomes a `correct` row to wire it in. The environment reviewer also flags information the agent could not get. Fixes inside the repository go to `correct`; setup outside it, such as connecting an MCP, is a `suggest` row that `reflect` never applies, because it is the user's setup and often needs credentials.

## Considered options

- **Generalize as far as possible.** Rejected: the most general wording ("take care not to lose user data") has no trigger and no action, so no agent behaves differently.
- **A hard line budget for instruction files.** Rejected: it would block `correct`'s rule table, which is meant to grow and shrink with each fix.
- **Widen history mode to read every project's transcripts** to find lessons for promotion. Rejected: it costs more miners and reads private conversations from other projects.
- **A single-agent mode like `retro`'s.** Rejected: ADR 0008 chose depth for session mode, and two paths would need upkeep.
