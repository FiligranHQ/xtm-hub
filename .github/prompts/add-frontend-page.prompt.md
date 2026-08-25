---
mode: agent
description: Add a Next.js App Router page wired to @tanstack/react-query, with i18n and @filigran/ui components.
---

# Add a frontend page

Create a new route in `apps/frontend/app/`.

Ask me for the route path and whether it is user-facing or admin if I have not already said.

## Steps

1. **Route.** Create the directory under `app/(application)/app/(user)/` for user-facing pages, or
   `app/(application)/app/(admin)/admin/` for the admin panel. Follow the surrounding route-group conventions.

2. **Query.** Preferred: write `apps/frontend/graphql/<domain>/<name>.query.graphql` (or `.mutation.graphql`), then
   run `yarn workspace @xtm-hub/frontend codegen` to refresh `apps/frontend/graphql/generated.ts` (aliased
   `@graphql/*`), which exports a typed `use<Name>Query`/`use<Name>Mutation` hook. Only use Relay's `graphql` tagged
   template if the task explicitly asks to extend an existing Relay-backed page; if so, the operation must already
   exist in `apps/frontend/schema.graphql` (see [`add-backend-module.prompt.md`](add-backend-module.prompt.md) if it
   does not), and needs `yarn workspace @xtm-hub/frontend relay` to regenerate `apps/frontend/__generated__/`.

3. **Component.** Call the generated hook with `portalGraphqlClient` from `@/lib/graphql-client` as the first
   argument, and manage cache invalidation with `useQueryClient()` from `@tanstack/react-query` (see
   `@/utils/query-cache` for existing helpers). For the Relay path, use `useLazyLoadQuery`/`usePreloadedQuery` from
   `react-relay` instead. Scaffold with `yarn workspace @xtm-hub/frontend generate:component` where it fits.

4. **UI.** Use `@filigran/ui` components and `@filigran/icon` icons. Only drop to raw TailwindCSS or shadcn
   primitives when `@filigran/ui` has no equivalent. Forms use `react-hook-form` with `zod` v4.

5. **i18n.** Every user-facing string goes through `next-intl`. Add the key to both
   `apps/frontend/messages/en.json` and `apps/frontend/messages/fr.json` — never hardcode copy. Verify with
   `yarn workspace @xtm-hub/frontend i18n:check`.

6. **Access control.** Gate admin or capability-restricted UI with the `useGranted` hook rather than hiding it in
   CSS.

7. **Tests.** Colocate a `*.test.tsx`. Render with `testRender` from `@/utils/test/test-render` and mock `next-intl`
   with `useTranslations: () => (key: string) => key`. For the Relay path only, use `createMockEnvironment()` from
   `relay-test-utils`. Prefer extracting logic into a pure `*.utils.ts` and testing that in isolation. See
   [`.github/skills/testing-validation/SKILL.md`](../skills/testing-validation/SKILL.md) for the full test-writing
   rules.

8. **Validate**: `yarn workspace @xtm-hub/frontend test:ci` and `yarn workspace @xtm-hub/frontend check-ts`.

## Constraints

- Import through `@/*` (→ `src/`), `@graphql/*` (→ `apps/frontend/graphql/`) and `@generated/*` (→
  `apps/frontend/__generated__/`), not deep relative paths.
- Never edit `apps/frontend/graphql/generated.ts`, `apps/frontend/__generated__/` or `apps/frontend/schema.graphql`
  by hand.
- Don't introduce new Relay usage; if migrating an existing component off Relay isn't in scope, leave it as-is.
- If Relay types look wrong, re-run `yarn relay` before debugging anything else.

Tell me which files you added and which translation keys I need to review.
