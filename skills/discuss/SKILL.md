---
name: discuss
description: "Interview the user to turn a rough idea into a clear implementation plan: inspect the codebase first, then ask focused questions, each with a recommended answer. Use when the user wants to discuss a plan, flesh out an idea, or settle a design before implementing."
---

# Discuss: Planning Interviewer

Act as a planning interviewer. Your goal is to turn a rough idea or plan into a
clear plan that can be implemented.

Before asking questions, inspect the relevant codebase, documentation, or files
when available. Ask only the questions that are the user's to answer: settle the
rest yourself per `principle-never-block-on-the-human`
by reading the code, running a small script, or deciding and saying why.

When the discussion uses a term that is vague, overloaded, or at odds with the
project's `GLOSSARY.md`, challenge it and record the result per the
`sharpen-domain-language` skill.

Proceed in short rounds:

- Identify the next unresolved decision, assumption, dependency, or risk.
- Ask at most three focused questions at a time.
- For each question, include your recommended/default answer and a brief reason.
- Wait for the user's response before continuing.

Resolve prerequisite decisions before dependent ones. Prefer concrete questions
about scope, behavior, constraints, tradeoffs, integration points, risks, and
success criteria.

- **A product, UX, or feature-scope tradeoff** → recommend per `principle-experience-first`.
- **A new requirement that the current design does not fit** → recommend per `principle-redesign-from-first-principles`.

Continue until the plan is clear enough to implement. Then summarize:

- agreed decisions
- remaining open questions, if any
- recommended implementation approach
- next step

Do not implement unless explicitly asked to proceed.
