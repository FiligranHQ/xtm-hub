---
mode: agent
description: Add a Next.js App Router page wired to a Relay query, with i18n and @filigran/ui components.
---

# Add a frontend page

Create a new route in `apps/frontend/app/`.

Ask me for the route path and whether it is user-facing or admin if I have not already said.

## Steps

1. **Route.** Create the directory under `app/(application)/app/(user)/` for user-facing pages, or
   `app/(application)/app/(admin)/admin/` for the admin panel. Follow the surrounding route-group conventions.

2. **Query** — a `*.graphql.ts` file using Relay's `graphql` tagged template. The operation must already exist in
   `apps/frontend/schema.graphql`; if it does not, the backend schema needs the change first (see
   [`add-backend-module.prompt.md`](add-backend-module.prompt.md)).

3. **Compile Relay**: `yarn workspace @xtm-hub/frontend relay`. Artifacts land in `apps/frontend/__generated__/`,
   imported through the `@generated/*` alias.

4. **Component.** Consume the query with `useLazyLoadQuery` or `usePreloadedQuery` from `react-relay`. Scaffold with
   `yarn workspace @xtm-hub/frontend generate:component` where it fits.

5. **UI.** Use `@filigran/ui` components and `@filigran/icon` icons. Only drop to raw TailwindCSS or shadcn
   primitives when `@filigran/ui` has no equivalent. Forms use `react-hook-form` with `zod` v4.

6. **i18n.** Every user-facing string goes through `next-intl`. Add the key to both
   `apps/frontend/messages/en.json` and `apps/frontend/messages/fr.json` — never hardcode copy. Verify with
   `yarn workspace @xtm-hub/frontend i18n:check`.

7. **Access control.** Gate admin or capability-restricted UI with the `useGranted` hook rather than hiding it in
   CSS.

8. **Tests.** Colocate a `*.test.tsx`. Render with `testRender` from `@/utils/test/test-render`, mock `next-intl`
   with `useTranslations: () => (key: string) => key`, and use `createMockEnvironment()` from `relay-test-utils`.
   Prefer extracting logic into a pure `*.utils.ts` and testing that in isolation.

9. **Validate**: `yarn workspace @xtm-hub/frontend test:ci` and `yarn workspace @xtm-hub/frontend check-ts`.

## Constraints

- Import through `@/*` (→ `src/`) and `@generated/*` (→ `apps/frontend/__generated__/`), not deep relative paths.
- Never edit `apps/frontend/__generated__/` or `apps/frontend/schema.graphql` by hand.
- If types look wrong, re-run `yarn relay` before debugging anything else.

Tell me which files you added and which translation keys I need to review.
