---
name: prototype
description: "Build a throwaway prototype to learn from someone using it before implementing a design. Use for hands-on exploration of state, logic, APIs, or UI options. Not for questions the agent can settle by reading code or running a script itself."
---

# Prototype

Follow Bob Moesta's approach: prototype to learn, not to verify. Try possibilities to discover the boundaries of the solution through contrasting prototypes, to help the user clarify what they want, learn about design tradeoffs and surface implicit and/or hidden assumptions. Do not use the prototype to prove that designs already chosen are right.

For logic, state, data shapes, or APIs, follow [LOGIC.md](LOGIC.md). For a visual design, follow [UI.md](UI.md).

Use the project's existing tools. Put the prototype next to the code it tests, and include `prototype` in its name or path. Tell the user how to start it. Keep state in memory unless storage is part of the question. Do not write to real production data; use stubbed actions or clearly named scratch storage.

Ask the user to try the prototype. Observe the session when you can; otherwise, ask what they did and how it differed from what they expected. Use what you learn to revise the prototype or the design, rather than steering them toward your preferred answer. Record what you learned. Implement the resulting design through the project's normal checks and remove the prototype.
