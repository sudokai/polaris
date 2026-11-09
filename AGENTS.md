# Working on polaris

Skills, playbooks, and principles are read by agents, cold and mid-task. Every sentence becomes an instruction that some future agent follows.

- **Keep an instruction only if the agent would act differently without it.** General good practice, common domain knowledge, and broad style advice do not earn a place on their own.
- **Keep exact commands, templates, detection phrases, and output contracts.** They are data, not prose to paraphrase.
- **Reserve absolute rules** for output contracts, safety, and failures you have seen. Elsewhere, give decision criteria.
- **Point, don't restate.** Name the skill or principle that owns a method instead of copying it. Copies drift apart.
- **Prefer structure to prose.** When a rule can be a script, a type, a lint, or a check, write that instead and point at it.
- **Match the scope.** A narrow task gets a short skill or playbook. Do not add sections for symmetry.

## References

- Name another skill by its name, and a principle by its slug. Only the router links into other skills.
- Link a file inside the same skill by a path relative to the file that contains the link. Add a Markdown link label when it helps the reader decide whether to open the file; otherwise use a backticked path.
- Keep configuration paths, output paths, and filename examples in backticks.

Before you commit, run the checks in the README's Develop section.
