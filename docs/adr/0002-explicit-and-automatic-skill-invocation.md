# Explicit and automatic skill invocation

polaris supports direct use of selected skills outside `/polaris`. An agent may start a bundled skill automatically only when it is useful without the router, starts no fan-out of subagents, writes nothing beyond the task, and is wanted in sessions that did not start with `/polaris`. Hiding every skill would prevent global instructions from using those capabilities. Exposing every skill would add context and allow costly or broader actions to start without the router.

`AGENT_INVOCABLE_SKILLS` in [the validator](../../scripts/check_plugin.py) owns the list. Invocation metadata must agree with it. The router is selected through `/polaris`; a hidden skill is available through its explicit command or a caller that reads its method. Automatic skill selection and caller-directed file reads are different mechanisms.

Principles ship as hidden `principle-<slug>` skills so users can choose each rule from the command menu. Agents apply principles through the router rather than selecting them as tasks. Plain files would avoid exposing descriptions in harnesses that ignore invocation controls, but would lose individual commands. One parameterized principle command would also hide those choices from the menu.

A missed automatic trigger belongs in an agent-invocable skill's description. A missed router trigger belongs in the router. `finalize-plan` stays explicit-only because saving a standalone plan is a separately requested outcome.
