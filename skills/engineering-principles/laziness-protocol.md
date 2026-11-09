# Laziness Protocol

- **Prefer deletion.** When you refactor or improve code, look for something to remove before you add anything.
- **Consolidate decisions.** Do not repeat the same choice in several places. Put it behind one source of truth and pass the result as a simple flag.
- **Minimize the diff.** Make the smallest change that solves the problem. Fewer lines beat "elegant" boilerplate.
