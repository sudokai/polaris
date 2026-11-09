# Guard the Context Window

**Why:** When the context window overflows, reasoning degrades, compaction drops details, and work stalls.

**Pattern:**
- **Send bulk work to subagents.** Let them read the large outputs and long files, and keep only their summaries in the main thread, not the raw output.
- **Size phases and cap scope.** Limit the files each phase reads, set a turn budget, and count the context that each tool call or subagent brief costs.
