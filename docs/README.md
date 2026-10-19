# polaris documentation

- [`GLOSSARY.md`](../GLOSSARY.md) defines the terms polaris uses.
- [`adr/`](adr/) records the decisions that shape the plugin and why they were made.
- [`open-work.md`](open-work.md) lists deferred work and harness behavior that is not yet verified.

The working contracts live with the skills: `skills/polaris/references/locations.md` for local files and local playbooks, `skills/polaris/references/models.md` for roles, and `skills/polaris/references/harnesses.md` for per-harness facts.

## Decisions

1. [polaris is a harness-neutral port of part of pstack](adr/0001-harness-neutral-port-of-pstack.md)
2. [Principles are plain files, not skills](adr/0002-principles-are-plain-files.md)
3. [Only the router is selected automatically](adr/0003-only-the-router-is-selected-automatically.md) (superseded by 13)
4. [Skills name roles, not models](adr/0004-skills-name-roles-not-models.md)
5. [Role agents for Claude Code and Grok Build](adr/0005-role-agents-for-claude-code-and-grok-build.md)
6. [Local files live under `.agents/polaris/`](adr/0006-local-files.md)
7. [Lessons never edit the bundled plugin](adr/0007-lessons-never-edit-the-bundled-plugin.md)
8. [`reflect` routes lessons, and `correct` fixes the repo](adr/0008-reflect-routes-lessons-and-correct-fixes-the-repo.md)
9. [Resume notes are selected explicitly, never by recency](adr/0009-resume-notes-are-selected-explicitly.md)
10. [Installing in each harness](adr/0010-installing-in-each-harness.md)
11. [Bundled skills and playbooks cannot be overridden locally](adr/0011-no-local-overrides-of-bundled-skills.md)
12. [Some of the user's global skills are folded into polaris](adr/0012-user-skills-folded-into-polaris.md)
13. [Cheap standalone skills start on their own](adr/0013-cheap-standalone-skills-start-on-their-own.md), replacing 3
14. [Eight more of the user's global skills are folded into polaris](adr/0014-eight-more-user-skills-folded-into-polaris.md)
15. [walkthrough is folded into polaris, and shares architect's red flags](adr/0015-walkthrough-folded-into-polaris.md)
16. [`reflect` generalizes each lesson as far as its scope, and no further](adr/0016-reflect-generalizes-lessons-by-scope.md)
