---
applyTo: '**/*.test.ts,**/*.test.tsx,**/*.utils.ts'
---

# Testing Instructions

Both apps use **Vitest**. Test files sit next to the source file they cover (`*.test.ts` / `*.test.tsx`).

## Prefer parametric tests with `it.each`

When several cases share the same assertion logic, use the template-literal form of `it.each` instead of duplicating
`it()` blocks. It keeps tests compact and failure output readable.

```typescript
it.each`
  input    | expected
  ${'foo'} | ${'FOO'}
  ${'bar'} | ${'BAR'}
  ${''}    | ${''}
`('should uppercase "$input" to "$expected"', ({ input, expected }) => {
  expect(toUpper(input)).toBe(expected);
});
```

- The first row is the header, interpolated into the test name via `$columnName`.
- Each following row is one case.
- Add a `description` column when the values alone are not self-explanatory.

```typescript
it.each`
  reason                       | expected                 | description
  ${'Other: my reason'}        | ${'Other: my reason'}    | ${'standard free text'}
  ${'Other:   extra spaces  '} | ${'Other: extra spaces'} | ${'whitespace trimmed'}
  ${'Other:'}                  | ${'Other'}               | ${'empty after colon'}
`(
  'should format "$reason" as "$expected" ($description)',
  ({ reason, expected }) => {
    expect(formatReason(reason)).toBe(expected);
  }
);
```

## Extract pure utilities instead of testing component internals

Move logic into a pure function in a `*.utils.ts` beside the component, then unit-test that in isolation. The
component just calls the utility.

```
TrialsTab.tsx             calls formatCancellationReason()
trials-tab.utils.ts       pure function, no React/Relay dependency
trials-tab.utils.test.ts  fast, isolated unit tests
```

A utility that imports React, Relay or `next/*` is a sign the split is in the wrong place.

## Frontend

- Render with `testRender` from `@/utils/test/test-render` (wraps the providers).
- Mock `next-intl` with `useTranslations: () => (key: string) => key` and assert on i18n keys, not translated copy.
- Mock Relay mutations with `useMutation: () => [vi.fn(), {}]`.
- Use `createMockEnvironment()` from `relay-test-utils` for queries.
- Stub heavy components that are not under test (for example `DataTable`) with a simple `<div>`.

## Backend

- Integration tests hit a real `test_database` PostgreSQL instance, selected by `VITEST_MODE=true`.
- Vitest runs with `fileParallelism: false`, so tests share the database — leave it in the state you found it.
- Group with `describe` per function/method, nesting a second level for scenario groups.
- Use `expect.any(Date)` and `expect.objectContaining()` for dynamic values instead of freezing timestamps.

## What to assert

Test observable behaviour and edge cases, not implementation details. A test that breaks on every harmless refactor
is a liability. Cover the empty, boundary and error paths — those are where the bugs are.
