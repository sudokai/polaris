# Sweep a plan for conversation residue

The reader of the plan did not take part in the conversation. Read the plan as that reader, and rewrite anything that makes sense only because of the conversation.

## Sweep these

- phrases that refer to the conversation, such as "as we discussed", "as agreed", "the earlier approach", or "the option you picked"
- decisions stated without their rationale
- names, labels, or terms that were coined during the conversation and are not defined in the plan
- descriptions of what changed between drafts instead of the final design
- rejected approaches that still appear as if they were options, unless the plan states why they were rejected
- details singled out only because they were recently added to the design
- references to files, symbols, or behavior that you have not verified in the code

## Keep these

- tradeoffs and rejected alternatives that are written as decisions with a reason, for example "Use X over Y because Z"
- links to issues, pull requests, or ADRs that give the reader more context

## The test

Does each statement stand on its own for someone who has not seen the conversation? If not, rewrite it.
