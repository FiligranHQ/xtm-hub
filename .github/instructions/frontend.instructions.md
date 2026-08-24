---
applyTo: 'apps/frontend/**'
---

# Frontend Instructions (`apps/frontend`)

Next.js 16 (App Router + Turbopack) + React 19 + Relay 20 + TailwindCSS 4 + `@filigran/ui`. Dev port **3002**
(Docker production serves on 3000 internally).

## Commands

Run from `apps/frontend` (or `yarn workspace @xtm-hub/frontend <script>`).

| Command | What it does |
| --- | --- |
| `yarn relay` | `relay-compiler` — **required after any GraphQL change** |
| `yarn codegen` | `graphql-codegen --config codegen.ts` |
| `yarn next typegen` | Generates `next-env.d.ts` and route types — **required before `check-ts`** |
| `yarn check-ts` | `tsc --noEmit` |
| `yarn lint` | `eslint .` |
| `yarn format` / `yarn format:check` | Prettier |
| `yarn test` | Vitest + jsdom |
| `yarn test:ci` | `lint` + tests with coverage — the full gate |
| `yarn build` | `relay-compiler && next build` |
| `yarn i18n:check` | Locale parity against `messages/en.json` |
| `yarn generate:component` | Scaffolds a component |

`yarn dev` runs `relay-compiler`, `codegen:watch` and `next dev` concurrently, so artifacts stay fresh while you work.
Outside `dev`, run `yarn relay` yourself after touching any `graphql` tagged template — stale artifacts surface as
confusing type errors in `__generated__/`.

**`next-env.d.ts` is gitignored and generated.** It is what declares `@public/*.svg` and the route types, so on a
fresh checkout `yarn check-ts` reports around twenty bogus `Cannot find module '@public/….svg'` errors. Run
`yarn next typegen` first — do not "fix" those errors by adding declarations.

## Layout

```
app/                                Next.js App Router
  (application)/app/(admin)/admin/  Admin panel
  (application)/app/(user)/         Service pages, org management, profile
  (public)/                         Public marketing routes
  (authentification)/auth/          Auth callbacks
  (embed)/                          Embeddable widgets
src/components/                     Components by domain; `ui/` holds shared primitives
src/hooks/                          useGranted, useDecodedParams, ...
src/relay/                          Client + server environments, SSR provider
src/i18n/                           next-intl config, locale, request scope
src/lib/  src/utils/                Helpers, server actions, middleware helpers
__generated__/                      Relay output — generated, never edit
messages/                           en.json, fr.json
middleware.ts                       Proxies /graphql-api, /graphql-sse, /auth/*, /document/*
schema.graphql                      Written by the backend, read by Relay
```

## Path aliases

- `@/*` → `./src/*`
- `@generated/*` → `./__generated__/*`

Use them instead of deep relative paths.

## UI components

`@filigran/ui` is Filigran's in-house component library and matches our design system. **Always reach for it first**
for buttons, inputs, tables, dialogs and the like. Fall back to raw TailwindCSS or shadcn/ui primitives only when
`@filigran/ui` genuinely has no equivalent.

- Icons: `@filigran/icon`
- Styling: TailwindCSS 4 with `FiligranUIPlugin` (see `tailwind.config.ts`)
- Forms: `react-hook-form` + `zod` (v4)
- Markdown: `@uiw/react-md-editor`

## Data fetching

The backend is reached through `middleware.ts`, which proxies to `SERVER_HTTP_API` (default `http://localhost:4002`).

Adding a page:

1. Create the route under `app/(application)/app/(user)/` or `(admin)/admin/`.
2. Add a `*.graphql.ts` file using Relay's `graphql` tagged template.
3. Run `yarn relay`.
4. Consume it with `useLazyLoadQuery` or `usePreloadedQuery` from `react-relay`.

Server-side fetches go through `src/relay/server-portal-api-fetch.ts`, which forwards Next.js cookies.

## Internationalisation

All user-facing strings go through `next-intl`. Add the key to `messages/en.json` and `messages/fr.json` — never
hardcode copy in a component. `yarn i18n:check` verifies parity.

## Tests

Colocate `*.test.tsx` next to the component.

- Render with `testRender` from `@/utils/test/test-render` (wraps the providers).
- Mock `next-intl` with `useTranslations: () => (key: string) => key`, then assert on i18n keys.
- Mock Relay mutations with `useMutation: () => [vi.fn(), {}]`.
- Use `createMockEnvironment()` from `relay-test-utils` for queries.
- Stub heavy components not under test (for example `DataTable`) with a plain `<div>`.

Prefer extracting logic into a pure `*.utils.ts` beside the component and unit-testing that, rather than exercising
component internals.

## Environment variables

`SERVER_HTTP_API` (default `http://localhost:4002`), `E2E_BASE_URL` (default `http://localhost:3002`),
`NEXT_PUBLIC_APP_VERSION`.
