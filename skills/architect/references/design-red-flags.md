# Design red flags

Screen a design or a change against these flags. A red flag is a reason to revise or reject the shape. The `architect` skill screens every candidate before synthesis, and the `walkthrough` skill flags them in the code it explains. Most come from John Ousterhout's *A Philosophy of Software Design*.

## Shallow module

A shallow module exposes a large interface while hiding little complexity. Judge depth by the capability and policy hidden behind the public surface relative to the size of that surface. Prefer a simple interface backed by substantial behavior.

Do not confuse a deep module with a deep call chain. A deep call chain scatters understanding across layers. A deep module concentrates capability behind one interface.

Look for these signs:

- Callers coordinate several methods to complete one operation.
- Public options expose internal stages or implementation choices.
- Learning the interface does not save the caller from learning the implementation.

## Information leakage

Information leakage makes multiple modules depend on the same internal decision. A representation, policy, or protocol detail appears in more than one place, so changing it requires coordinated edits.

Public re-exports of transport or wire types are leakage. Parse external data into domain types behind the interface. Keep storage schemas, framework objects, and protocol details private.

## Temporal decomposition

Temporal decomposition organizes modules by execution order instead of the knowledge they own. Separate load, validate, transform, and save stages often repeat one representation and its invariants across several boundaries.

Group code around domain knowledge and ownership. Methods that run at different times can still belong to one module when they protect the same decisions.

## Pass-through method

A pass-through method forwards the same arguments to another method with the same shape. It adds a layer without hiding complexity.

Remove it or move responsibility to the module that can complete the operation. Keep a forwarding boundary only when it adds policy, adaptation, or a distinct abstraction.

## Split ownership

More than one module writes the same state or keeps its own copy of it. An agent that edits one writer can't see the others, so their rules diverge.

Give each piece of state one owner. Other modules read it or ask the owner to change it.

## Two ways to do one task

The design supports more than one way to do the same task. An agent copies whichever way it finds first, so every way keeps gaining callers.

Keep one way. Move callers off the others and delete them in the same change.

## Importable internals

A caller can import a module's internals. An agent takes the shortest path that compiles, so it imports them directly and they become part of the interface.

Make internals unreachable from outside the module, so an import from outside fails the build.

## Hand-synced list

Two or more places list the same items, and adding an item means editing every list. An agent that sees one list updates only that one.

Keep one list and derive the others from it. If a list can't be derived, make the build fail when the lists disagree.

## Hidden coupling

Code breaks when an unrelated piece changes, and nothing in either piece says they depend on each other.

## Overexposure

Callers must learn about rarely used features to use the common ones. Give the common case a default and keep the rare options out of its way.

## Repetition

The same code appears in several places, so a fix in one place misses the others.

## Special-general mixture

Code for one use case sits inside a general-purpose mechanism. Move the special case to its caller and keep the mechanism general.

## Conjoined methods

Two methods can't be understood without reading each other. Merge them, or move the shared knowledge into one of them.

## Needless complexity

The code is more complex than the problem requires, such as extra layers, options, or states with no current use.

## Non-obvious code

A reader can't tell what the code does or why without working it out, such as a hard-to-read condition. Name the condition, or restructure the code so the intent shows.

## Vague or hard-to-choose names

A name says little about what it holds or does, or no good name fits. A name that is hard to choose often means the code does more than one thing.

## Interface that needs a long comment

An interface that takes a long comment to describe is usually too complex. Simplify it before documenting it.

## Comment that repeats the code

A comment says what the next line already says. Delete it, or replace it with the reason the code can't show.

## Interface comment that describes the implementation

A comment on an interface explains how it works inside, so callers learn details they should not depend on. Describe what callers can rely on instead.
