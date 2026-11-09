# Migrate Callers Then Delete Legacy APIs

When you introduce a new internal API, move every caller to it and delete the old API in the same pass. Don't keep a compatibility layer for callers you could have moved.

- Update tests to assert the new contract, and delete tests that only protect pre-refactor implementation details

**When this applies:**
- No external users depend on backward compatibility
- The project can absorb coordinated breaking changes
- The new API is part of a cleanup or refactor
