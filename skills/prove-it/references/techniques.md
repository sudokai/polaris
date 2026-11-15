# Proof techniques

Use these when the real behavior is hard to reach, or when a few hand-checked cases cannot settle the claim. Before falling back to a unit test, build the missing piece: each technique replaces one unreachable part and keeps everything else real. Name what a technique replaced in the report's limitations.

## Evidence by kind of change

- **Visual or layout bug**: before and after screenshots of the same state; measured positions or sizes; every affected size, theme, and input method.
- **Interaction or flow**: a recording of the real flow with a real moving pointer that also passes over neighboring elements; state facts after each step; the state after a reload.
- **Race, crash, or timing bug**: the failure reproduced with the timing forced; logs showing the bad order of events before and its absence after; a test that fails when the fix is reverted.
- **Distributed or backend behavior**: timestamped logs across components; database and API state before and after; the failure and recovery paths.
- **Performance**: follow [the measured-numbers checklist](measured-numbers.md).
- **Refactor**: identical recorded behavior before and after across many inputs; a planted change that the comparison detects.
- **Security or access**: the denied case denied and the allowed case allowed, against the real identity provider or its staging version; no collateral revocations.
- **Feature whose output varies between runs, such as one that calls a model**: pass rates over repeated runs of each case, before and after.
- **Agent instructions (prompts, guidance files, skills, tool descriptions)**: follow [the eval method](agent-instructions.md).
- **Delivery ("is it live?")**: the deployed version contains the commit; production logs or metrics show the new path running.

## External services

- Use the vendor's local tooling when it exists: an official mock server, a CLI that forwards and triggers webhooks, a local emulator of a cloud service, an S3-compatible object store, or an SMTP sink that captures mail.
- Otherwise build a fake of the part of the API the code uses: a local HTTP server with realistic responses, state, errors, pagination, and idempotency, which sends webhooks signed with the vendor's real signing scheme. Point the app at it through its existing base-URL configuration. A fake Stripe, for example, creates customers and subscriptions, declines a card on request, and posts signed `invoice.payment_failed` events.
- Ground the fake in the vendor's published API spec or in recorded real responses.
- Check the fake against the real service before trusting it. Send the same calls to the vendor's sandbox and to the fake, diff the status codes, bodies, and webhook payloads, and fix the fake until the calls the code makes show no differences.
- Use the fake for what the real service forbids: thousands of runs without rate limits, abuse detection, or cost, and failures that are dangerous to trigger for real, such as outages, partial writes, and malformed responses.
- A fake proves the code against your model of the vendor, not the vendor itself. Name the faked boundary in the report.
- For sign-in, run a local mock identity provider and complete the real redirects in a browser.
- Replace a dependency whose output varies, such as a language model, with a scripted fake when the change is not about that dependency, so that both runs get identical input.

## Failures and timing

- Freeze a dependency with `kill -STOP` and resume it with `kill -CONT` to simulate a hang. Kill it with `kill -9` to test crash recovery.
- Delay, drop, or fail chosen requests with browser request interception or a proxy that adds latency and resets connections.
- Force the bad order of events with a gate in the code under test, or with a delay injected identically in both runs. Show that the delay took effect in each run.
- Fake the clock, or rewind a poller's cursor, to reach expiry, retry, and polling windows without waiting.
- Cause the failure on purpose: fill the disk, make a config file read-only, revoke a permission, or expire a token.

## Environments and states

- Pin the whole system under test, including the operating system, services, and tool versions, with a lockfile, a container image, or Nix, so that the before and after runs differ only by the change.
- Simulate a second machine or client with a separate home or state directory or browser profile. Use a second real account for permission and multiplayer cases.
- Build the old and new versions side by side to test mixed versions, such as an old client against a new server.
- Recreate the reporter's environment: the repository shape (no remote, a stale remote default branch, a path with spaces), the data volume (the same message count), and the OS settings (text size, theme, locale).
- When a native app wraps web content, inject the same bridge script the native shell runs into a browser to reproduce the shell's state, then confirm on a real device, or on a simulator when no device is available.
- Seed the database with production-shaped data. For query plans, scale the planner statistics to production size.
- To test with real data, copy it one way into an isolated state directory or database. Never point a test run at live user state, and never copy test state back.

## Production

Production has the real data, load, and users, so evidence from it is the strongest. Reading is the default. Ask before anything that changes production, and never change real users' data to prove a change.

When the product allows it, from least to most invasive:

- **Read what production records**: logs, metrics, traces, error reports, and query statistics, through read-only credentials. Measure how often the bug happens before the change, and show the new code path running after it.
- **Test without changing anything**: run the new query or its plan against a read replica, or create an index inside a transaction, measure the query, and roll the transaction back.
- **Run the new code next to the old**: compute the new result next to the old one and log every difference, or run a new check in log-only mode. Switch to enforcing only after the logs show no false positives.
- **Gate it**: ship behind a feature flag enabled only for test accounts and reproduce the scenario there. Then widen the rollout in steps while watching error rates and latency, with a rollback ready.
- **Add diagnostics**: logging, metrics, or read-only admin endpoints whose only purpose is to let an agent see what production did.

Many products cannot be tested in production: software that customers install or host, such as desktop, mobile, embedded, and on-premises products; regulated systems and systems that move money; and services without telemetry or without access for you. Get as close as the product allows:

- Replay recorded production traffic, traces, or incidents against the new build, after removing personal data.
- Test against an anonymized or production-shaped copy of the data at production volume.
- Ship to a channel that users opt into, such as a beta or nightly build, or a small rollout percentage, and read its crash and error reports.
- Send the reporter a test build to confirm the fix, or read the logs or diagnostic bundle they provide.

Silence in production logs means the case did not occur, unless you show that it occurred and was handled.

## Comparing against a known-correct answer

When something independent already gives the right answer, compare against it across many inputs instead of checking a few cases by hand.

- Possible sources of the right answer: the code before the change (for a refactor or an optimization), an upstream library, another implementation of the same format or protocol, the production service, or a reference implementation's snapshot or conformance tests.
- Generate the inputs: a property-based testing library, a fuzzer, a corpus of real inputs such as recorded requests, or every combination of a small set of options. Feed each input to both sides and diff the outputs.
- Reuse the reference's own test suite when it has one: parse its inputs and expected outputs and run them against the new code, with a skip list that shrinks to zero.

## Rules that must always hold

- State the property in one sentence, for example "a customer is charged exactly once" or "every queued message is delivered or reported as failed".
- Generate sequences of operations with a property-based testing library, and check the property after every step.
- Run the same sequences while injecting faults, using the techniques in [Failures and timing](#failures-and-timing). A property that holds only on the happy path is not proven.
- For a distributed system, check the property under network partitions, clock jumps, and crashed containers. A deterministic simulation platform, such as Antithesis, runs the real containers, injects these faults, and replays the exact schedule that broke the property.
- Make failures replayable: fix and record the random seed, or run under a deterministic simulator, so that a failing sequence can be rerun on both sides.

## Behavior that varies between runs

- Run each scenario many times on both sides with identical inputs. Choose the count and the passing rate before running.
- Report pass rates per scenario, such as 3 of 10 before and 10 of 10 after, and read the failing transcripts to tell a real failure from an acceptable variation.
- Pin what can be pinned, such as seeds, temperature, and recorded tool results, so the remaining variation comes from the part under test.
- Run both sides enough times to tell flakiness that exists on the base from flakiness the change introduced.

## Simulated users

Scripted cases cover only the paths someone thought of. Have agents act as users: give each a persona and a goal, let it drive the real interface or the stack backed by fakes, and record what it did. Include adversarial users who take steps in the wrong order, enter invalid input, cross permission boundaries, and push past limits. Judge each run against its goal and report the share that succeeded.

## Observing what the user cannot see

- Read the persisted result, such as the stored tool output, the database row, or the commit, rather than a UI's or an agent's report of it.
- Inspect a launched process's real arguments and environment, for example through `/proc/<pid>/cmdline` and `/proc/<pid>/environ` on Linux.
- Count resources before, during, and after: open file descriptors, file watches, sockets, and child processes.
- Record network traffic as a HAR file to count requests, bytes, and repeated fetches.
- For a terminal UI, capture the pane with its colors and render it, or run a real terminal emulator and record its window.
- For animation, record at a high frame rate and inspect every frame for jumps and jitter.
- When a change must prevent something, assert its absence: no mail in the sink, no row written, no process spawned.

## Validation tooling worth building

When a proof needs setup the project lacks, build it as reusable tooling rather than one-off test code, so the next proof runs on demand. Put it where the project keeps similar tooling, and name it in the report so the user can decide whether to keep it. For example:

- A dev server whose logs from every component are easy to read and search
- One command that starts the app and its dependencies end to end
- A seeded test account with a signed-in browser session
- A local fake of an external service
- Seed commands that recreate common repository and data states, including edge cases
- A headless command-line entry point to the core logic, so that agents can drive it without a UI
- Screen state encoded in the URL, so that a link reproduces exactly what a user saw
- A development mode that writes outbound email, SMS messages, and one-time codes to the logs
- A command that copies real data one way into isolated state for testing
- Read-only, scoped production access to logs, metrics, and traces, and safe test queries, such as ones run inside a transaction that is rolled back

Do not commit one-off proof scripts or extra tests only to leave a record of the proof. The report and its evidence are the record.
