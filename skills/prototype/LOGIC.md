# Logic prototype

Build a small terminal interface that lets the user try cases that are hard to judge on paper. Write the question and run command in the prototype's README. Choose cases that could reveal missing states, ambiguous rules, or behavior the user did not anticipate.

Add the actions needed to try those cases. After each action, show the relevant state, the result, and the available next actions. Explain why an action was rejected. If the output becomes hard to read, clear the screen before showing the new state.

Keep the proposed logic separate from terminal input and output if you may reuse it. Use the functions and state representation the design needs; do not force every question into a state machine. Use the existing runtime and libraries rather than adding a terminal framework for styling.

Ask the user whether anything behaved differently from what they expected. Use their answer to choose the next case or revise the model, not just to show that the current model works.
