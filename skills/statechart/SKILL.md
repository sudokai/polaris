---
name: statechart
description: "Check a TLA+ model of a system that moves between states, such as a product flow, a protocol, or a service, and draw it as a Mermaid statechart. The report gives the shortest path to each state that breaks a rule. Use to show a bug as a path through states."
---

# Statechart

Model a system in TLA+, check it with TLC, and draw its states as a chart that the person who decides on the behavior can read. That person is the reader: write every label in their words, and let them judge whether the behavior is right.

## Run

Work in a scratch folder outside the repository. Write a spec and its config, then run:

```sh
<skill dir>/scripts/statechart SPEC.tla [--config FILE] [--view FILE] [--out DIR]
```

The script needs Node 22.18 or later, Bun, or Deno. Its first run installs TLC and Java with mise, so it needs the network. `--out` must name a new or empty folder. The command writes into it the report, `chart.mmd`, `tlc.out`, and a `tlc-RULE.out` for each rule whose bug path the chart does not show. The command exits 0 when every rule holds, 1 when a rule breaks, and 2 when TLC or the command fails.

## Write the spec

- Make each rule that the reader agrees to an INVARIANT. If the model has no variable for a rule, add one. Never weaken a rule to make it hold.
- Write `Next` as a disjunction of named actions, such as `YouPressPlay \/ YouPressStop`. Otherwise every step is called `Next`.
- A state with no step out breaks `NoDeadlock` (`CHECK_DEADLOCK` if the config already uses that name), even a correct end state. Add an action that holds only in end states and changes nothing, such as `Done == phase \in {"paid", "failed"} /\ UNCHANGED vars`, and label it in `step()`.
- TLC keeps exploring past a broken rule, so a model without bounds can run forever. Keep constants small, or add a CONSTRAINT.

## Write the view

The view module, passed with `--view`, holds your judgment: the labels, phases, colors, and title. Its functions must depend only on their arguments, because the command calls each one at most once per model state or step.

`state(vars)` returns the reader's name for a model state. Its type picks the chart:

- A string gives a flat chart: `export const state = (v) => (v.paid ? "Paid" : "Paying");`
- An array gives nested states: `export const state = (v) => v.main.split(".");`
- An object gives one parallel region per key: `export const state = (v) => ({ Playback: v.playback, Volume: v.volume });`

In `vars`, a TLA+ sequence is an object keyed from 1 (`v.pc[1]`), and a set is an array.

Name states by what the reader sees or cares about, such as "Paying" or "Lease held, write pending", never by variable names.

`step(action, from, to)` gets the TLC action name and the values before and after, and returns the arrow label. Write it as what happens to the user, such as "you press play" or "the connect fails", not as the code or action name. Give the same label to actions that end in the same chart state, so they share one arrow. Put a condition at the end in brackets, in the reader's words: `you press play [while the file loads]`. In a regions chart, don't write conditions on other regions, such as `[when Offline]`. The command adds them, and any brackets you write replace them. When a hidden value decides where a step goes, name the outcome: "the roster read fails".

Optional exports: `group(vars)` returns a phase name, and each chart state gets its group's color. A chart state gets no color when the model states behind it fall in different groups. `colors` maps groups to blue, orange, purple, yellow, teal, tan, or pink. `title` is a string shown at the top.

## Keep the chart readable

The chart leaves out steps that stay on one label, so split a label when the reader must see such a step. Aim for about 20 arrows or fewer. First coarsen `state()`: merge values that act the same and drop details the reader does not need, such as a call in flight whose return changes nothing. Keep every state on a bug path, and never merge states that break different rules, or the reader cannot see which rule breaks where.

If it is still too busy, return `null` from `step()` for steps the reader does not need, such as a reset available everywhere. When you hide steps:

- Keep every chart state reachable from a start state.
- Keep at least one arrow out of each chart state that has a step out in the model.
- Hide all the steps behind an arrow or none, so its condition stays true.
- Say in the hand-off which steps the chart hides.

## Read the report

- `breaks` marks a chart state where every model state behind it breaks a rule. `mayBreak` marks one where only some do. Merging states can turn `breaks` into `mayBreak`. The legend names the rules for each mark. When a mark covers two rules, say in the hand-off which state breaks which rule.
- In a regions chart, a mark can mean that the state breaks a rule only together with a state in another region. Check the bug path in the report before saying which state is wrong.
- The chart includes states after a bug, because TLC goes past it.
- With VIEW or SYMMETRY, TLC lets one state stand for each set of equivalent states, and an arrow can lead to that representative. The report says when this happens.
- TLC checks rules in states past a CONSTRAINT or ACTION_CONSTRAINT, but does not explore them or check them for deadlock. The chart draws such a state only when it ends a shortest bug path.
- After a rule breaks, the command removes it and runs TLC again, until no rule breaks. These reruns stop at 100,000 distinct states. Rules that a rerun did not reach are listed under "Rules not checked": they may hold or break. To check them, remove the broken rules from the config or shrink the model.
- `tlc.out` is TLC's output on the config as written.

## Show and hand off

Show `chart.mmd` as a `mermaid` code block. Above 500 states, the chart draws only the paths to broken rules, and there is no chart when every rule holds; the report still gives the state count and every bug path. Shrink the model to see the whole graph. When the user asks for an image, or the chart is too large to read as text, render it as [render.md](references/render.md) describes.

Give the chart to the person who must decide. For each bug, add one line: the rule, the reader's sentence for it, and the path as the report numbers it. Say what the model leaves out, and give the command that regenerates the files with a new `--out` folder.

When the model describes code, replay each bug path against the real code, one step per action, as a test or a live reproduction. If the bug does not occur, assume the model is wrong until you show otherwise.
