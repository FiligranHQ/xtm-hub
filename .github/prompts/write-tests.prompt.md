---
mode: agent
description: Add Vitest coverage for existing code using the repository's it.each and pure-utility conventions.
---

# Write tests

Add Vitest coverage for code I point you at. Ask me which file or behaviour to cover if I have not said.

Follow [`.github/skills/testing-validation/SKILL.md`](../skills/testing-validation/SKILL.md) for the test-writing
rules: Given/When/Then structure, `it.each` dataset quality, fixture constants, mocking policy (mock only at
boundaries), and never rewriting an existing test without asking. The steps below are the XTM Hub-specific mechanics
that skill doesn't name.

## Steps

1. **Read the target first.** Identify the real branches: empty input, boundaries, error paths, and any behaviour a
   caller depends on. Do not write tests that only restate the happy path.

2. **Place the test** next to the source file: `foo.ts` → `foo.test.ts`, `Foo.tsx` → `Foo.test.tsx`.

3. **Extract before testing, when needed.** If the logic is buried in a component, move it into a pure
   `*.utils.ts` beside the component and test that in isolation. A utility that imports React, Relay or `next/*` is a
   sign the split is in the wrong place.

4. **Frontend specifics.** Follow [`.github/instructions/testing.instructions.md`](../instructions/testing.instructions.md)'s
   "Frontend tooling" section for `testRender`, `next-intl` mocking, react-query vs. Relay mocking, and the global
   `setup-vitest.ts` mocks.

5. **Backend specifics.** Integration tests hit the real `test_database` (`VITEST_MODE=true`) and run with
   `fileParallelism: false`, so they share state — clean up after yourself.

6. **Run them**: `yarn workspace @xtm-hub/backend test` or `yarn workspace @xtm-hub/frontend test`. Backend tests
   need `docker compose -f xtm-hub-dev/docker-compose.yml up`.

## Constraints

- Do not add new testing tools or libraries — use what is already in the workspace.
- Do not weaken an assertion to make a test pass. If the code is wrong, say so.

Tell me what you covered, what you deliberately left uncovered, and any bug the tests exposed.
