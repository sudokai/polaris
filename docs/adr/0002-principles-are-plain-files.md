# Principles are plain files, not skills

pstack stores each principle as its own skill. polaris stores them as plain files in `skills/polaris/principles/`, and the router indexes them with one line each. Harnesses that ignore `disable-model-invocation` would otherwise list 24 principle descriptions in every session, which wastes context and lets an agent pick a principle as if it were a task. Plain files load only when the agent applies them, on every harness. `scripts/check_plugin.py` checks that every principle file appears in the router's index.
