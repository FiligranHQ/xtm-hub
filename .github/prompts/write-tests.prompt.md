---
mode: agent
description: Add Vitest coverage for existing code using the repository's it.each and pure-utility conventions.
---

# Write tests

Add Vitest coverage for code I point you at. Ask me which file or behaviour to cover if I have not said.

## Steps

1. **Read the target first.** Identify the real branches: empty input, boundaries, error paths, and any behaviour a
   caller depends on. Do not write tests that only restate the happy path.

2. **Place the test** next to the source file: `foo.ts` → `foo.test.ts`, `Foo.tsx` → `Foo.test.tsx`.

3. **Extract before testing, when needed.** If the logic is buried in a component, move it into a pure
   `*.utils.ts` beside the component and test that in isolation. A utility that imports React, Relay or `next/*` is a
   sign the split is in the wrong place.

4. **Use `it.each` for repeated assertions** — the template-literal form, so failure output stays readable:

   ```typescript
   it.each`
     input    | expected
     ${'foo'} | ${'FOO'}
     ${''}    | ${''}
   `('should uppercase "$input" to "$expected"', ({ input, expected }) => {
     expect(toUpper(input)).toBe(expected);
   });
   ```

   Add a `description` column when the values alone are not self-explanatory.

5. **Group with `describe`** per function or method, nesting a second level for scenario groups.

6. **Frontend specifics.** Render with `testRender` from `@/utils/test/test-render`. Mock `next-intl` with
   `useTranslations: () => (key: string) => key` and assert on i18n keys, not translated copy. Mock Relay mutations
   with `useMutation: () => [vi.fn(), {}]`, and use `createMockEnvironment()` from `relay-test-utils` for queries.
   Stub heavy components not under test with a plain `<div>`.

7. **Backend specifics.** Integration tests hit the real `test_database` (`VITEST_MODE=true`) and run with
   `fileParallelism: false`, so they share state — clean up after yourself. Use `expect.any(Date)` and
   `expect.objectContaining()` for dynamic values rather than freezing timestamps.

8. **Run them**: `yarn workspace @xtm-hub/backend test` or `yarn workspace @xtm-hub/frontend test`. Backend tests
   need `docker compose -f xtm-hub-dev/docker-compose.yml up`.

## Constraints

- Test observable behaviour, not implementation details. A test that breaks on every harmless refactor is a
  liability.
- Do not add new testing tools or libraries — use what is already in the workspace.
- Do not weaken an assertion to make a test pass. If the code is wrong, say so.

Tell me what you covered, what you deliberately left uncovered, and any bug the tests exposed.
