# Callers coordinate tasks; skills own methods

Playbooks own task sequencing, handoffs, completion checks, and delivery. Skills own complete capability methods and their acceptance procedures. Callers reuse valid findings and evidence instead of repeating a completed step. When no playbook fits, `figure-it-out` designs one using the shared execution rules.

A skill can complete its own requested outcome without taking over the surrounding task. `architect` produces a design, while `finalize-plan` turns a settled design from any source into a standalone implementation plan. Their caller sequences them when both outcomes are requested. Neither requires the other, and plan finalization returns missing design decisions to the caller instead of redesigning or implementing the solution. `discuss` settles decisions without automatically saving a plan.

Mandatory chaining between these skills was rejected because a user can request either outcome independently. Shared references supply methods without transferring coordination to the referenced skill. Writing skills therefore preserve the caller's plan, playbook, or PR format.

`deslop` and `sweep-residue` stay separate because simplifying implementation and removing conversation residue are different outcomes. Shared review criteria live in one reference rather than separate lists in each caller.

The execution contract lives in [playbook guidance](../../skills/polaris/playbooks/README.md). Capability details stay with their skills.
