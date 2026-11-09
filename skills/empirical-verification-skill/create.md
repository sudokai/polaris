# Create a verification skill

## 1. Learn the app from the repo

Answer from the code, and ask the user only what you cannot observe:

- **Surface:** what a user touches: a web UI, a CLI or TUI, a desktop app, an API, a mobile app, or a library. Pick the primary one and note the rest.
- **Run:** the repo's own dev command, ports, environment variables, seed data, and auth.
- **Drive:** existing harnesses first, such as Playwright or Cypress specs, expect scripts, PTY helpers, HTTP endpoints, or a debug port. Otherwise use browser automation for web and Electron, tmux or a PTY for a CLI or TUI, and plain HTTP for a service.
- **Observe:** screenshots, terminal transcripts, response bodies, logs, exit codes, and database state.
- **Isolate:** whether two instances can run side by side. If not, the skill must refuse to drive an instance it did not start.

Make the checkout build and start before you write anything. Fix startup within scope, or report what blocks it. If an irrelevant missing asset blocks startup, such as a static folder the API never serves, the skill may create it as marked scaffolding and remove it in cleanup.

## 2. Write the skill

Write the skill in a scratch folder. Give `SKILL.md` frontmatter with `name: verify-<app>` and a `description` that names the app, the surface, and when to use it. Without frontmatter, the skill never registers. Use the repo's real commands and selectors, and leave no placeholders. Include these sections:

- **Launch:** the command that starts the app from an empty data folder, including migrations and seed data, and how to tell that it is ready. Ready means usable, not just answering: a database health check can pass while its init scripts still run. For a short-lived CLI or TUI, build once, then start each drive in its own isolated PTY or tmux session.
- **Doctor:** one read-only check that this instance is worth driving: the process is up, the build is right, the port belongs to this run, and auth is valid. The agent runs it first whenever anything looks off.
- **Drive:** the harness recipe. Prefer stable handles, such as ARIA labels, data attributes, prompt strings, and routes, over coordinates. State these rules:
  - Wait for specific text or state, never a fixed sleep.
  - Take one action at a time, and capture the state after each.
  - Click by coordinates only right after a fresh screenshot. Never reuse element handles after the page changes.
  - When several windows share a debug port, pick the page by an app marker. If none matches, list the pages instead of guessing.
  - Do not add a browser or terminal library to the project for a one-off probe.
- **Evidence:** what to capture and where it goes. Drive the real user path, not internal setters or test-only endpoints. Capture the action and the resulting state, and check side effects such as files written, rows inserted, or messages sent. Mock only where a production boundary already isolates the external system. Ask before saving screenshots from a privacy-sensitive workspace. When the safe path is a dry run, observe what it really skips: some dry runs still use the network or open a browser.
- **Cleanup:** stop only what the run started, never by process name. Remove instances and scratch state, and keep the evidence at the location the skill names.
- **Helpers:** every script the skill ships is executable, and the skill shows how to call it.

## 3. Seed the feature map

Create `features/README.md` and one file per user-facing feature. Start with the three to five most important features, found from routes, commands, menus, or docs. Follow [the example map](references/feature-map-example/README.md). Each feature file has the sections `Sub-features`, `How to get to it (user POV)`, `Driving it with <harness>`, and `Gotchas`, and names the observable end state that proves the feature works.

If the seed data lacks a precondition that a journey needs, the journey fails and the reason goes in `Gotchas`. Never weaken a journey to make it pass. A proof that drives one convenient entry point is incomplete when the map lists others.

## 4. Accept, then install

1. Pick one mapped feature. Success means the skill reaches it, captures the action and the resulting state with its side effects, and keeps the evidence after cleanup.
2. Follow the skill on the real app from its documented starting conditions, through launch, doctor, drive, evidence, and cleanup, and get a verdict with `prove-it`. Use only what the skill documents.
3. Check that the evidence is at its named location after cleanup, and that failed attempts left no processes or scratch state.
4. Fix failing instructions or helpers, and repeat the affected checks. Report app defects and missing prerequisites. Do not weaken a criterion to pass.
5. Move the skill into the project skill directory.

Report the skill's path, the features in its map, its commands, the verdict with evidence paths, missing prerequisites, and behavior left unverified. Tell the user to run this skill's maintain mode after the app changes.
