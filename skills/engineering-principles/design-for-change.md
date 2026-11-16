# Design for Change

Judge code by how easily it can change, not only by how well it reads today. A small change in requirements can force a rewrite of code that looked elegant.

The most flexible design is usually the simplest one. Direct code with few functions and classes and no extra layers is cheap to change, whatever the change turns out to be. An abstraction built for imagined changes looks flexible, but its shape comes from today's cases. The change that actually comes usually doesn't fit that shape, so you end up working around the abstraction or rewriting it.

Before you settle on a design, name the two or three requirement changes most likely to come next. For each one, work out the concrete edit it would need in the simplest design that works today.

- If the edit stays in one place, the simple design is flexible enough. Keep it.
- If the edit has to touch many places or rewrite code, the cause is usually one choice in the current design. For example, a function receives a value already computed from the input, but the change needs the input itself; or a name is hard-coded where it should be a parameter. Change that one choice instead of adding a layer.
- Add an abstraction, such as a registry, a dispatch table, an interface, or a class hierarchy, only when one of the changes you named needs it and no simpler fix works. Say which of those changes it is for.
- Do not design for changes you cannot name. Do not design for more cases of a kind the code already handles either: adding another dict entry or another branch is already cheap.

Whatever the design, keep everyday edits cheap: moving or renaming code, finding and fixing a mistake, and tracing a behavior back to the code that causes it. If one of these edits forces changes far from the code you meant to touch, or requires knowing something the code doesn't show, change the design.
