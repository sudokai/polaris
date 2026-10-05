# Pause safely

**You own a clean stop. Leave a checkpoint that a cold-start agent can resume from.**

Pause only on an explicit request to pause, or when the session is about to run out of context. On "keep going", "going to bed, keep going", or "don't stop", do not pause.

1. Stop at a safe boundary. Finish the current atomic step or back out of it. Start nothing new, and stop any subagents you started.
2. Take no irreversible action to pause. Do not open a pull request or push unless one was already out.
3. Make the work durable. Commit uncommitted edits as one clear `wip:` commit on the current branch so that nothing is lost. If the tree is broken, say so in one line of the commit body.
4. Write the resume note to `.polaris/resume/<slug>.md` in the project root. Keep it out of version control: if git does not already ignore the path, add `.polaris/resume/` to `.git/info/exclude`. The note holds the intent, what you were doing, progress and what is verified, the current state, the next steps, the key files, and gotchas. If a `show-me-your-work` decision log exists, point at it instead of repeating it. The Session pickup playbook looks for the note there.

**Reply:** where you are in the work, what is on disk and what was only in your context (paths, no diff dumps), the commits you made and whether the tree is clean, the resume note's path, and the first action on resume. This is a pause, not a final report.
