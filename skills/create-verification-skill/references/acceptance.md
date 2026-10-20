# Accept a generated verification skill

Check a generated verification skill before calling it ready. Use this procedure directly or from a playbook.

## Inputs

Read the generated skill, feature map, and helpers. Check the documented starting conditions and required access against the current environment. Reuse findings that still apply and fill any gaps.

## Procedure

1. Define success: the instructions reach one mapped feature, capture the action and resulting state, and preserve evidence after cleanup. Include the feature's required observable side effects.
2. Use `prove-it` on the real app. Follow the generated launch, doctor, drive, evidence, and cleanup instructions from the documented starting conditions. Use the user path, without internal setters or undocumented preparation.
3. Confirm evidence remains at its named location after cleanup. Clean up failed attempts too, removing their processes and scratch state while keeping evidence.
4. Correct failed instructions or helpers, or return the defects to their author. Repeat affected checks. Report app defects and missing prerequisites; do not weaken criteria to pass. An unexecuted skill remains a draft.
5. Report the verdict, tested feature, starting conditions, evidence paths, and limits. If using a stand-in, state what ran and which steps on the real target remain unverified.

Explain how to use the skill and maintain it after feature changes with `maintain-verification-skill`. Suggest a cadence only if asked. If later cleanup changes the skill or helpers, refresh affected evidence before calling them ready.
