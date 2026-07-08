---
name: Testing and Validation
description: Shared XTM Hub expectations for adding tests and validating changes.
---

# Testing and Validation

Shared testing and validation expectations for XTM Hub code changes. Layer- and
domain-specific test rules (e.g. backend integration testing) build on top of
these.

## Adding Tests
- Add or update tests near the changed files (`*.test.ts` / `*.test.tsx`).
- Use the project's testing helpers and mocking conventions already used in the
  codebase.
- Favor deterministic tests and avoid brittle implementation-detail assertions.
- Use parametric tests with `it.each` when tests share logic but differ in data sets.
- Use the array form `(it.each([...]))` when a test case value is null or undefined
- Check tests aren't redundant with others.
- Proactively identify edge cases and ensure comprehensive coverage.

## Validating Changes
Run focused checks scoped to the changed files after every change.

- Backend (`apps/backend`): `yarn check-ts`, `yarn lint`, `yarn test`.
- Frontend (`apps/frontend`): `yarn relay` (required before build and after any
  GraphQL schema change), then `yarn check-ts`, `yarn lint`, `yarn test`.
- Report exactly what was executed and its outcome. Never claim a check passed
  without running it.
