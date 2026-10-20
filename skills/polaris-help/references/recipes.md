# Prompts worth copying

Swap in the real paths, skills, and done checks. Informal wording works. Write each command in the form the user's harness shows.

## Understand

- `/polaris read <thread>. restate the underlying issue in your own words, in plain english.`
- `/restate-my-intent <long or messy ask>`
- `/sharpen <the prompt you're about to send>`
- `/polaris investigate why <symptom>. give me what we know, what data you used, and your best hypotheses. don't change any code yet.`
- `use /how to understand <subsystem>. then use /why to find out why it broke recently.`
- `/recall my work on <topic> from last week, then read <issue>.`
- `/polaris take over this branch. read the decision log, find what's done, and continue. don't redo finished work.`

## Build

- Bug: `/polaris <symptom>. repro first, then fix and verify.`
- Bug in an app: `/polaris repro this with /verify-<app>. if it repros on main, fix it and show me a video as proof.`
- Feature: `/polaris add <behavior>. <current output> stays byte-identical. verify both.`
- Refactor: `/polaris move <code> into one module, zero behavior change. record the current output first and prove it's unchanged after.`
- Perf: `/polaris <operation> takes <time> on <fixture>. trace it, fix the measured cause, show me before and after.`

## Design and plan

- `/polaris prototype a few options for <feature>. take screenshots or videos for me to compare.`
- `/polaris build <feature>. use architect for the design, and prototypes for choices I need to try. stop for my review before implementing.`
- `/polaris write a tutorial for how i would use <new package> first, then build it.`
- `/polaris turn this design into a plan. small verifiable PRs, each with its own verification steps.`

## Review and verify

- `/blast-radius <change>. what could this break outside the diff?`
- `/prove-it <claim>. baseline from main, treatment from this branch.`
- `/create-formal-verification-skill prove <property> holds in <module>, even when <steps> interleave or retry.` After merges or refactors in that code: `/maintain-formal-verification-skill`.

## Away and back

- `/polaris im going to bed. <goal> in a fresh worktree off <base>. done means <checks>. keep a full decision log. don't ask me before committing. if you're truly stuck after a few hours, stop and write up why.`
- `/ketchup` catches you up on this session since your last message and lists every call that waits on you.
- `/reflect capture what we learned so the next run doesn't repeat it.` Approve only changes that alter a future decision.
- `/say-it-plainly <text>` rewrites AI prose in plain words, with enough context to understand it. Without a target, it rewrites the last reply.
