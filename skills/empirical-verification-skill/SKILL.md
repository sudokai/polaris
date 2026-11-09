---
name: empirical-verification-skill
description: "Create or maintain a project-local verification skill that launches the app, drives it the way a user does, and captures evidence, in any language or platform. Use when a project has no scripted way to prove UI, CLI, or service behavior, or when the app changed and its verification skill may be out of date."
disable-model-invocation: true
---

# Empirical verification skill

A verification skill lets the next agent prove behavior on the real app: launch it, drive a feature the way a user would, and capture evidence. It lives in the project as `verify-<app>/`, in the project skill directory that your harness reads, with a feature map in `verify-<app>/features/`. Write it for an agent that reads it cold, mid-task, and has never seen the app.

A project verification skill is one whose body has launch and drive sections and a feature map, usually `verify-*/`. If several exist, ask which one. Pick the mode, and say which:

- **Create** when the project has none: follow [create.md](create.md).
- **Maintain** when one exists and the app changed, or the user asks to audit it: follow [maintain.md](maintain.md).

Install a new skill only after it passes acceptance, so that any verification skill in the project has been run at least once.
