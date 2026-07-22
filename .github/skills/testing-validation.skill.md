---
name: Testing and Validation
description: Shared XTM Hub expectations for adding tests and validating changes.
---

# Testing and Validation

Shared testing and validation expectations for XTM Hub code changes. Layer- and domain-specific test rules (e.g. backend
integration testing) build on top of these.

## Adding Tests

- Add or update tests near the changed files (`*.test.ts` / `*.test.tsx`).
- Use the project's testing helpers and mocking conventions already used in the codebase. Mock the less possible. Don't
  mock children components.
- Favor deterministic tests and avoid brittle implementation-detail assertions.
- Use parametric tests with `it.each` when tests share logic but differ in data sets. Don't use conditions in parametric
  tests (in this case, it's not a parametric test!)
- Use the array form `(it.each([...]))` when a test case value is null or undefined
- Check tests aren't redundant with others.
- Proactively identify edge cases and ensure comprehensive coverage.
- Mandatory test structure: Use Given/When/Then in every test, with one main business assertion per scenario.
- Naming convention: Use should <expected behavior> when <context> to avoid vague test titles.
- No implementation-detail assertions: Test observable behavior (UI output, function result, DB side effect), not
  internal details (user facing)
- Clear mocking policy: Mock only at boundaries (network, clock, UUID, storage); avoid mocking pure business logic.
- Strict determinism: Freeze time, use fixed random seeds, and avoid any dependency on test execution order.
- High-quality it.each datasets: Always include nominal cases, boundary cases, invalid inputs, and known regressions.
- Readable fixtures: Prefer builders/factories (makeUser, makeOrg) over large inline objects.
- Anti-flaky rules: No arbitrary setTimeout, no implicit waits, no sleep.
- Systematic cleanup: Reset mocks/DB/state between tests using the repository’s standard hooks.

## Validating Changes

Run focused checks scoped to the changed files after every change.

- Backend (`apps/backend`): `yarn check-ts`, `yarn lint`, `yarn test`.
- Frontend (`apps/frontend`): `yarn relay` (required before build and after any GraphQL schema change), then
  `yarn check-ts`, `yarn lint`, `yarn test`.
- Report exactly what was executed and its outcome. Never claim a check passed without running it.
