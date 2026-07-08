---
name: Coding Conventions
description: Shared XTM Hub coding conventions and code quality expectations for application code.
---

# Coding Conventions

Shared mandatory coding rules and quality expectations for XTM Hub application code.
Backend and frontend agents both build on these; each layer may add stricter,
stack-specific rules on top.

## Mandatory Coding Rules
- Never use `console.log` in application code.
- Prefix every intentionally unused variable with `_` (e.g. `_unused`).
- Use strict typing; avoid `any` unless there is no practical alternative.
- Keep code deterministic, testable, and explicit about errors.
- Domain and app constant names start with an uppercase letter, while keeping
  existing file casing (e.g. `this-file-casing.ts`).

## Code Quality Expectations
- Keep units focused; extract non-UI/pure logic into utility functions when
  complexity grows.
- Validate inputs and handle error paths explicitly (including loading, empty,
  and error states where relevant).
- Consider performance implications (queries, loops, I/O, network calls,
  rerenders, overfetching, large lists) and avoid obvious bottlenecks.
- Preserve existing naming conventions, folder structure, and import style.
- Add concise comments only when the logic is non-obvious.
- Never use as type casts unless strictly necessary and explicitly justified. Prefer proper typing over casting.
