---
name: lantern
argument-hint: "[what to explain: a PR, a commit, a diff, or how some code runs]"
description: "Make an animated, steppable explainer of a code change or of how code runs, as a Lantern player page that works offline. Use for /lantern, or when asked to animate or step through a PR, a diff, an algorithm, or a flow."
---

# Lantern

Make an animated explainer that the user can play, pause, and step through: one `player.html` file that opens in any browser, with no server and no network. It's built with [Lantern](https://github.com/ivarvong/lantern), which this skill bundles.

An explainer can show one of two things:

- **A code change**, such as a PR, a commit, or a diff. The steps show the behavior before the change, then after it. For example, a request goes to the database before the PR and hits the cache after it.
- **How code runs**, such as an algorithm, a data structure, or a request flow. The steps follow the code as it runs. For example, a ring buffer fills up and wraps around.

For a single still picture, such as a call tree or a data shape, use the `show-me` skill instead. For a full, staged explanation of a change, use the `walkthrough` skill.

## What you write

You write a scene: a JSON file with named steps. Each step changes what's on screen and the `state`, which holds the few values the explainer is about. A script turns the scene into the player page.

Read [the scene format](vendor/DOC-FORMAT.md) before you start, and use [the ring-buffer scene](vendor/ring-buffer.doc.json) as an example. Write your files to a scratch directory, not the user's project, unless the user asks for them there.

## Plan the scene

Decide these before you write any JSON:

- **The state.** Pick the few values the explainer is about, such as `head`, `tail`, and `len`. They go in `state`, and the `readout` shows them on screen.
- **The steps.** Each step makes one point and has a short name that says what happens, such as `before`, `after`, `push-a`, or `cache-miss`. Five to twelve steps is usually right. If you need more, split the explainer into two scenes. For a change, show the old behavior first, then the new one.
- **Each step's inputs.** Put them in the step's `meta`, such as `{ "op": "push", "value": "a" }` or `{ "pr": 482 }`. The player shows them under the step's name, and they let anyone replay the step against the real code.
- **The code panel.** Show only the lines the steps point at, copied from the real source. Use `focus` to highlight the line that runs.
- **The layout.** The frame is 16 units wide and 9 tall, with the origin in the center and y pointing up. Give the diagram, the code panel, and the readout their own areas so they never overlap.

Every value in `state` must come from the real code. Run the code, or read it closely; don't guess. If a value comes from reading rather than running, tell the user.

If many steps repeat, write a short script that generates the JSON instead of writing each step by hand.

## Make the player

Run the render script from this skill's directory. It needs Node 22.18 or later.

```bash
node scripts/render-lantern-doc.mts <scene.json> <out-dir>
```

It writes `player.html`, the explainer itself. It also writes files for checking it:

- `<step>.svg` and `<step>.txt`: what each step leaves on screen, as a picture and as text. The text file ends with the state the step changed.
- `trace.json`: the state before and after each step.
- `motion.txt`: things that move badly, such as objects that jump, pop in, or flicker. The script exits with status 1 if there are any.

If the scene has a mistake, such as a step that names a node that doesn't exist, the script stops with an error. Fix the scene and run it again.

## Check that it looks right

A player that renders without errors can still be hard to read, wrong, or confusing. Check all three:

1. **Readable.** Look at a screenshot of each `<step>.svg`, not just the text files. The text files are a quick first look, but they hide some problems: a label drawn on a box's border shows up only as text inside the border line. Every label should sit inside its shape, nothing should overlap or run off the frame, and all text should be big enough to read.
2. **True.** The highlighted line should be the one that runs in that step. Each step's `after` state in `trace.json` should match what the real code produces for that step's inputs. If you can, run the code with those inputs and compare.
3. **Clear.** Each step should make one point, and the steps together should tell the story in order. Someone who hasn't read the code should be able to follow it.

Fix every problem in `motion.txt`, or tell the user why it's fine.

Then open `player.html` in a browser and play it once from start to end. It starts playing on its own. Check that the motion between steps makes sense, not just the frames where steps end.

## Hand it over

Show `player.html` as [rendering guidance](../polaris/references/rendering-pictures.md) describes, and give the path to the scene JSON so the user can change it.

Tell the user how to use the player: Space plays and pauses, the arrow keys move between steps, and **Copy link** copies a link to the current step. In a link, `?scene=scene&step=<name>` opens the player at that step.

## Update the bundled Lantern

`vendor/` holds Lantern built from one fixed commit: `lantern.mjs` for the render script, and `player.html`, the player page before a scene is added. `vendor/VERSION` names the commit and lists the files in `patches/`, which fix bugs in Lantern. The `player/` folder holds the code that makes the player play the scene embedded in its page.

To move to another commit, run `scripts/build-lantern-bundle.sh <commit>` from this skill's directory. It needs network access and `npx`. Review the changes in `vendor/`, then render the ring-buffer scene and play it to check that both still work. When Lantern fixes a bug that a patch covers, delete that patch.
