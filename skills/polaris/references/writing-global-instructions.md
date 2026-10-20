# Writing global instructions

## Global instruction files

Each harness reads its own global instruction file:

- **`claude-code`**: `~/.claude/AGENTS.md`
- **`codex`**: `$CODEX_HOME/AGENTS.md`, by default `~/.codex/AGENTS.md`
- **`grok-build`**: `~/.grok/AGENTS.md`
- **`pi`**: `~/.pi/agent/AGENTS.md`
- **`hermes`**: `~/.hermes/SOUL.md`
- **`dsh`**: `$DSH_HOME/AGENTS.md`, by default `~/.dsh/AGENTS.md`
- **`cursor`**: a rule file in `~/.cursor/rules/` with `alwaysApply: true` frontmatter, such as `agents.mdc`

### Writing a line for every harness

A user-level line that holds in every harness goes into each harness's global instruction file:

1. List the harnesses on this machine: those whose command exists (`claude`, `codex`, `grok`, `pi`, `hermes`, `dsh`) or, for `cursor`, whose `~/.cursor/rules/` directory exists.
2. Resolve each harness's file to its real path (`realpath`). Files linked to one shared file resolve to the same path, so write to each real path once.
3. Skip a file that already contains the line. Otherwise append it. If a harness has no file yet, propose creating it.

Report each file written and each one skipped because the line was already there.

To check that a harness loads its file, run a one-shot session and ask whether its context contains a line from the file: `claude -p`, `codex exec --skip-git-repo-check`, `grok -p`, `pi -p`, or `hermes -z`. Check `cursor` in the editor, because its command-line agent does not load this file. Check `dsh` in an interactive session.
