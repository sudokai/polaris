---
name: prototype
description: "Build a throwaway prototype to learn from someone using it before implementing a design. Use for hands-on exploration of state, logic, APIs, or UI options. Not for questions the agent can settle by reading code or running a script itself."
---

# Prototype

Follow Bob Moesta's approach: prototype to learn, not to verify. Build contrasting prototypes to find the boundaries of the solution. They help the user clarify what they want, learn the design tradeoffs, and surface implicit or hidden assumptions. Do not use the prototype to prove that designs already chosen are right.

## Propose prototypes

Write down the question the prototypes should help answer. Then propose at least three contrasting solutions to the same problem. Find the contrast in one of these ways:

- **Radically different solutions:** different concepts, models, layouts, or flows. Use this especially for UI and UX, where contrast helps the user see what they want and sparks new ideas. Contrast concepts rather than polishing or tuning one conservative design; variants that differ only in color, wording, or parameter values teach nothing new.
- **Same solution, different scope:** from the simplest, most straightforward solution you could wire up in hours or a couple days, to the most complete and architecturally sound solution that could take months, including a balanced solution in-between.

For each proposal, say in a sentence or two what it is and which assumption or tradeoff it would expose. For scope variants, also give the rough cost and what the solution leaves out. Ask the user which proposals to build before you build them; they may add, merge, or drop some.

## Build and run

Use the project's existing tools. Put the prototype next to the code it tests, and include `prototype` in its name or path. Tell the user how to start it. Keep state in memory unless storage is part of the question. Do not write to real production data; use stubbed actions or clearly named scratch storage.

Each variant only needs to behave like its solution, not be built like it; skip polish that does not affect what the user learns. Give every variant the same realistic data or cases, chosen to expose missing states, ambiguous rules, and behavior the user did not anticipate. Let the user switch variants without losing their place: for logic, a command in a small terminal program; for a UI, a URL parameter such as `?variant=A` on an existing page, enabled only in development or preview builds.

Ask the user to try the prototype. Observe the session when you can; otherwise, ask what they did and how it differed from what they expected. Use what you learn to revise the prototype or the design, rather than steering them toward your preferred answer. Record what you learned. Implement the resulting design through the project's normal checks and remove the prototype.
