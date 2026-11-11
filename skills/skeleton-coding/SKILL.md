---
name: skeleton-coding
description: "Write a code-like skeleton (layout, types, signatures, contracts, invariants) before implementing a new module, library, or multi-file feature. Use when tests alone leave the design open, or for \"skeleton first\" or \"stub it out\". Skip it when the change fits in one function or existing code already sets the structure."
---

# Skeleton coding

## Why write the skeleton first

- **Tests don't fix the design.** Which tests you need depends on how the code is structured. A set of tests can be enough for one structure and far from enough for another. Until the structure is written down, you can't tell whether your tests are enough, and adding more tests doesn't solve that.
- **A skeleton lets you test each function.** A bug inside one function may show up in the final output only for a few rare inputs, and end-to-end tests have to find those inputs. With the functions and their contracts in place, a few tests per function catch the bug directly.
- **Some requirements can't be tested.** Two programs can return the same results while one is easy to maintain and the other isn't, or one stays within its memory budget and the other doesn't. Output tests can't tell them apart, so the skeleton is the only place to state these requirements.

In experiments across four models and three benchmarks ([Skeleton Coding, arXiv 2610.38214](https://arxiv.org/abs/2610.38214)), a code skeleton cut test failures roughly in half compared with the best tests and examples alone. It helped even when the full reference behavior was available, and the resulting code was less tangled. Those skeletons came from correct reference code. A skeleton with the wrong structure leads to wrong code, however good the tests are.

## Steps

1. Create the planned files in the target language and stub every body with `...`, `unimplemented!()`, or `throw new Error("not implemented")`.
2. Declare the modules, the data types with their fields, and every function's signature. Say which module may call which and how data moves between them. Give each folder, module, and function a short docstring.
3. Add a contract to every function: what the caller must ensure, what the function returns, and what it must leave unchanged. If you can't cover every function, start with the most complex ones.
4. If a rule spans several functions, write it in `INVARIANTS.md`, list the functions that must keep it, and cite its ID in those functions' docstrings.
5. Write down each requirement that tests can't check, such as how data is stored or a resource limit, in the docstring of the module or function it applies to.
6. Delete contract lines that state the obvious.
7. Implement the bodies without changing the signatures or contracts. If the skeleton turns out to be wrong, fix the skeleton first, then the code.

A function contract:

```python
class View:
    buffer: list[float]; offset: int; stride: int; size: int

def slice_view(v: View, lo: int, hi: int) -> View:
    """Return a slice that shares the original buffer.

    Requires:
        The caller SHALL ensure 0 <= lo <= hi <= v.size.
    Ensures:
        The callable SHALL return r with r.buffer is v.buffer,
        r.stride == v.stride, r.offset == v.offset + lo * v.stride,
        and r.size == hi - lo.
        The callable SHALL NOT modify v or its buffer.
    Invariants: I1
    """
    ...
```

An entry in `INVARIANTS.md`:

```markdown
## I1: <name>
WHEN any public method returns THEN THE SYSTEM SHALL <property that holds across calls>.
Participants: <Class.method>, <Class.method>
```

## Best practices

- **Write code, not prose.** A prose design doc usually describes the structure less well than stubbed code, even when it is several times longer.
- **Describe each folder.** A bare folder tree barely helps.
- **Be precise, not exhaustive.** Contracts that are correct but too detailed can make the code worse.
- **Word contracts so they can't be misread.** Read literally, a contract must rule out the wrong behavior. If the wording allows a mistake, no check will catch it.
- **Keep interfaces small.** Each function's behavior should be clear from a short contract or a few tests.
- **Make contracts add up.** If each function's contract fully states what it needs and what it guarantees, functions that meet their own contracts also work together. You then need no integration tests and can build and check one module at a time. The cost is a longer skeleton, so balance this against keeping contracts short.
- **Check each function against its contract,** not only the public API. When a function fails, redo that function, not the whole program.
- **Use checks a machine can run.** Where you can, enforce contracts with types, assertions, or property tests. A check is only worth trusting if it lets bad code through much less often than bad code gets written.
- **Keep the contracts with the code.** Once the bodies exist, the docstring contracts and `INVARIANTS.md` are the skeleton. Commit them with the code, and update them before the code when requirements change. When you add a feature, rewrite to fit the contracts instead of patching around behavior no contract asks for.
