# Explain the Number

- **Write down the decision before you measure.** Name the result that would change a decision, and the noise floor. Stop when the spread between runs is larger than the effect.
- **Ask "why not double?"** Name the resource or code path that bounds the result, such as a core, a lock, the disk, the network, or the load generator itself. Get it from a profile or from system counters taken during a run, then map it to source. Reading the code can suggest a limiter but cannot confirm one. If you cannot say why the number is not twice as good, you do not know what you measured.
- **List what else the number could be measuring, and rule out each one with evidence.** The usual suspects are errors, skipped or cached work, code that never ran, one side of a comparison left on default settings, noise, and a piece too small to matter end to end.
- **Keep the evidence with the number.** Put the run count, the spread, and the limiter in the notes or a linked artifact.

For an eval result, ask the same of the trials: did every run do the task, does the gap hold across trials and models, and does the scenario matter.

You skipped this if you started a run before naming the result that would change a decision, if a number has no run count, spread, or named limiter beside it, or if the claimed saving is larger than the total time the changed part took.

This differs from `prove-it-works.md`, which checks that an output is real.
