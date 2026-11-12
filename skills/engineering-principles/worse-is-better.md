# Worse Is Better

This principle applies only to internal code. For user-facing products, follow `experience-first.md` instead.

Every design trades off simplicity, correctness, consistency, and completeness. "The right thing" puts a simple interface and a complete design first. Worse is better puts a simple implementation first. To keep the implementation simple, it gives up some completeness and consistency, and asks the code that uses it to do a little more work.

Choose worse is better. Ship a simple version that covers most cases early, then extend it toward full coverage as real use shows which missing cases matter. A simple version ships sooner, is easy to port and to combine with other code, and gets used. Building the right thing first usually fails in one of two ways:

- **The big complex system.** The last 20% of cases takes 80% of the effort, so it ships late and large.
- **The diamond-like jewel.** It stays small and elegant, but takes forever to design and is hard to make fast.

Unix is the classic example. When a system call is interrupted, the right thing is for the operating system to back out and restart the call. Unix returns an error instead, and the program that made the call checks for the error and retries. The operating system stays simple, and the program does one small extra step.

Apply it this way:

- **Leave out rare cases** that would add real complexity. Leaving a case out beats handling it inconsistently.
- **Get the core right.** Build the first version on the core the full version will need: the same data model, the same main path, and an interface you can extend. If the full version would need a different core, you cut the wrong thing.
- **Cut scope, never correctness.** Every case you claim to handle must work. A case you left out must fail loudly with an error, like Unix does. Never return a wrong answer silently.
- **Hand a step to the code that uses yours only if that code can't skip it**, such as an error it must handle. If the step is easy to forget, or would be repeated everywhere, do it in your own code.
- **Name what you left out** where the next person will look: the error message, the docs, or the PR description.

To decide whether a case is needed at all, see `subtract-before-you-add.md`.
