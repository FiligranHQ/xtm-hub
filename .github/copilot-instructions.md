# XTM Hub - Coding Agent Instructions

## Critical Rules

- **No console.log** — Use `logApp` (backend) from `src/utils/app-logger.util.ts`. `console.warn` and `console.error` are only allowed in scripts or launch code not directly related to the app.
- Unused variables must be prefixed with `_` (e.g. `_unused`).

## Repository Overview

XTM Hub is the unified entry point for Filigran's ecosystem — a marketplace for cybersecurity resources, knowledge-sharing platform, and community engagement hub. It is a full-stack TypeScript monorepo.

- **Version**: 1.5.3
- **Architecture**: Yarn 4 workspaces monorepo
- **Runtime**: Node.js 24.13.1 (see `.nvmrc`)
- **Package Manager**: Yarn 4.12.0 via Corepack (`packageManager` field in root `package.json`)

### Applications

| Workspace          | Path                    | Stack | Dev Port |
|--------------------|-------------------------|---|---|
| `backend`          | `apps/backend`          | Express 5, Apollo Server, GraphQL, Knex, PostgreSQL, Elasticsearch, MinIO | 4002 |
| `frontend`         | `apps/frontend`     | Next.js 15 (App Router + Turbopack), React 19, Relay 20, TailwindCSS 3, `@filigran/ui` | 3002 |
| `portal-e2e-tests` | `apps/portal-e2e-tests` | Playwright | — |

## Setup

```bash
corepack enable          # REQUIRED — without this, yarn commands fail with version mismatch
yarn install             # from repo root, installs all workspaces
```

`corepack enable` must run before ANY yarn command. The global yarn (1.x) will NOT work.

## Development

### Local Infrastructure (Docker Compose)

```bash
docker compose -f xtm-hub-dev/docker-compose.yml up
```

Starts: PostgreSQL (5434), MinIO (9002), Elasticsearch (9204), Kibana (5603), PgAdmin (8888), Mailpit (8025/1025).

### Dev Servers

```bash
yarn dev:api             # starts backend on :4002
yarn dev:front           # starts frontend on :3002 (needs API running first)
```

## Build & Validation

### Backend (`apps/backend`)

```bash
yarn build               # esbuild compile + copy .graphql and migration .js files
yarn check-ts            # TypeScript type check (noEmit)
yarn lint                # ESLint
yarn lint:fix            # ESLint auto-fix
yarn test                # Vitest (sets VITEST_MODE=true)
yarn test:coverage       # with V8 coverage
```

### Frontend (`apps/frontend`)

```bash
yarn relay               # REQUIRED before build — runs relay-compiler + generate-enum script
yarn build               # relay + Next.js production build
yarn check-ts            # TypeScript type check
yarn lint                # next lint (ESLint)
yarn lint:fix            # auto-fix not available via next lint, use prettier
yarn test                # Vitest + jsdom
yarn test:coverage       # with V8 coverage
```

**`yarn relay` must run after any GraphQL schema change.** The `dev` script runs relay-compiler automatically via `concurrently`.

### E2E Tests (`apps/portal-e2e-tests`)

```bash
yarn test:e2e            # Playwright (requires frontend + backend running)
yarn test:e2e:ui         # Playwright UI mode
```

E2E runs with `workers: 1` (sequential), `retries: 2`, Chromium only. Base URL defaults to `http://localhost:3002`.

## GraphQL Pipeline

This is the most important data flow to understand:

1. **Schema definition**: `.graphql` files in `apps/backend/src/modules/**/` and `src/nodes/`
2. **Backend codegen**: `yarn generate:ts` in backend → runs `graphql-codegen` → produces `src/__generated__/resolvers-types.ts`
3. **Schema export**: When `NODE_ENV` is not production/staging/development, the API writes `schema.graphql` to `apps/frontend/schema.graphql`
4. **Relay compilation**: `yarn relay` in frontend → reads `schema.graphql` → generates TypeScript artifacts in `apps/frontend/__generated__/`
5. **Enum generation**: `yarn generate:enum` (part of `yarn relay`) → extracts enums from the schema into TypeScript

GraphQL resolvers are merged in `src/server/graphql-schema.ts`. Each module typically has: `*.graphql` (schema), `*.resolver.ts`, `*.service.ts`.

## Repository Structure

### Root

```
.nvmrc                  # Node 24.13.1
.yarnrc.yml             # Yarn 4 config: node-modules linker, scripts disabled, 3-day age gate
.rules                  # Project rules (no comments in code)
tsconfig.json           # Base TS config (extended by workspaces)
graphql.config.yml      # Points to apps/backed/**/*.graphql
codecov.yml             # Coverage reporting (informational only)
renovate.json           # Dependency automation
.husky/pre-commit       # Runs lint-staged in backend then frontend
chart/                  # Helm chart for Kubernetes deployment
xtm-hub-dev/            # Docker Compose files (dev + CI)
```

### Backend — `apps/backend/`

```
src/index.ts                    # Entry point — Express + Apollo Server + SSE setup
src/config.ts                   # Configuration via node-config library
src/crons.ts                    # Scheduled jobs (node-cron)
src/portal.const.ts             # Platform constants (UUIDs, roles, system user)
src/pub.ts                      # GraphQL PubSub for subscriptions
src/session-store-manager.ts    # Session store (PostgreSQL or memory)
src/shutdown.ts                 # Graceful shutdown logic
src/modules/                    # Feature modules (each has .graphql + .resolver.ts + .service.ts)
  common/                       # Shared GraphQL types (PageInfo, Connection, etc.)
  organization-management/      # Organization & user management
    organizations/              # Organization management
    users/                      # User management
      user-admin/               # Admin user operations
      user-domain/              # User domain logic
      user-organization/        # User-organization relationships
      user-pending/             # Pending user requests
      user-profile/             # User profile
      user-transferRequest/     # User transfer requests
  service/                      # Service instances and definitions
    instance/                   # Service instances
    definition/                 # Service definitions
  service-link/                 # Service links
  deployment/                   # Deployment requests
    competitor/                 # Competitor tracking
    group/                      # Deployment groups
    quota/                      # Deployment quotas
  document/                     # File management (MinIO)
    domain/                     # Document domain logic
  shareable-resource/           # Shareable resources
    opencti/                    # OpenCTI resources
      integration/              # OpenCTI integrations
      custom-dashboard/         # OpenCTI dashboards
    openaev/                    # OpenAEV resources
      scenario/                 # OpenAEV scenarios
  registration/                 # Platform registration
    service-configuration/      # Service configuration/contracts
  security-management/          # Security & capabilities
    authentication/             # Authentication providers
      provider/                 # OIDC / local providers
    capability/                 # Platform capabilities
    service-capability/         # Service-level capabilities
    user-organization-capability/ # User-org capabilities
    user-service-capability/    # User-service capabilities
  settings/                     # Platform settings + labels
  subscription/                 # Subscription management
  user-service/                 # User-service relationships
  role-portal/                  # Role management
  telemetry/                    # Telemetry data
  log/                          # Activity logs
  use-case/                     # Use cases
    object-use-case/            # Object-linked use cases
  xtm-suite-roadmap/            # XTM Suite roadmap
src/security/                   # Authorization (GraphQL directives, access control, guards)
  directive-graphql/            # @auth GraphQL directive
  restriction/                  # Access restrictions
  util/                         # Security utilities
src/context/                    # AsyncLocalStorage contexts (request, database transaction)
src/model/                      # TypeScript models
  kanel/                        # Auto-generated types from PostgreSQL (via kanel)
  portal-context.ts             # PortalContext type (user, req, res)
  user.ts                       # User type definitions
src/nodes/                      # GraphQL Node interface (Relay-compatible)
src/scripts/                    # Utility scripts
src/server/                     # Server setup
  apollo-plugins/               # Apollo Server plugins
  endpoints/                    # Express endpoints
  mail-template/                # Email templates
src/stores/                     # Session store (PostgreSQL)
src/thirdparty/                 # External services
  elasticsearch/                # ES client + migrations
  minio/                        # S3-compatible storage
  auth0/                        # Auth0 integration
  hubspot/                      # HubSpot webhooks
  copilot/                      # Copilot integration
  pgboss/                       # Job queue (pg-boss)
src/utils/                      # Utilities (logger, hashing, formatting, feature flags)
  error/                        # Error handling utilities
src/seeds/                      # Production seed data
src/migrations/                 # Knex database migrations (.js files)
src/es-migrations/              # Elasticsearch migrations
config/                         # node-config JSON files
  default.json                  # Default config (dev ports, local services)
  development.json              # Dev overrides
  production.json               # Production overrides
  staging.json                  # Staging overrides
  local.json                    # Local overrides (gitignored pattern)
  custom-environment-variables.json  # Env var → config mapping
knexfile.ts                     # Knex migration config (imports knexconfig.ts)
knexconfig.ts                   # Base Knex connection config
codegen.yml                     # GraphQL Code Generator config
vitest.config.ts                # Vitest config (globalSetup, sequential)
eslint.config.mjs               # ESLint flat config (typescript-eslint strict)
.prettierrc                     # Prettier config (single quotes, trailing comma es5, organize-imports plugin)
test.Dockerfile                 # Docker image for running unit tests in CI
Dockerfile                      # Production Docker image
```

### Frontend — `apps/frontend/`

```
app/                            # Next.js 15 App Router
  Layout.tsx                    # Root layout
  (application)/app/            # Authenticated app routes
    (admin)/admin/              # Admin panel (users, orgs, labels, services, trials, parameters)
    (user)/                     # User-facing routes
      service/                  # Service pages (vault, integrations, dashboards, scenarios, registration)
      manage/                   # Organization management
      profile/                  # User profile
  (public)/                     # Public routes (cybersecurity-solutions, landing)
  (authentification)/auth/      # Auth callback routes
  (embed)/                      # Embeddable widget routes (register, unregister)
  login/                        # Login page
  health/                       # Health check endpoint
src/
  components/                   # React components by domain
    ui/                         # Shared UI components (dialogs, badges, pagination, search, etc.)
    admin/                      # Admin components
    service/                    # Service-related components
    organization/               # Organization components
    login/                      # Login components
    menu/                       # Navigation menu
    ...
  hooks/                        # Custom React hooks (useGranted, useDecodedParams, useIsMobile, etc.)
  relay/                        # Relay client setup
    environment/                # Client + server Relay environments
    relay-provider.tsx            # SSR-compatible Relay provider with streaming
    server-portal-api-fetch.ts     # Server-side GraphQL fetch (uses Next.js cookies)
  i18n/                         # Internationalization (next-intl)
    config.ts                   # i18n configuration
    locale.ts                   # Supported locales
    request.ts                  # Request-scoped locale
  lib/                          # Utility functions (utils, omit, pick, regexs)
  utils/                        # Application utilities
    middleware/                  # Next.js middleware helpers (GraphQL proxy)
    actions/                    # Server actions
    format/                     # Formatting utilities
    shareable-resources/        # Shareable resource helpers
    test/                       # Test utilities
__generated__/                  # Relay compiler output (auto-generated, do not edit)
messages/                       # i18n translation files
  en.json                       # English translations
  fr.json                       # French translations
scripts/
  generate-enum.ts              # Generates TS enums from GraphQL schema
  extract-error-code-translation-keys.ts  # Extracts error codes for i18n
middleware.ts                   # Next.js middleware (proxies GraphQL, auth, document routes to API)
schema.graphql                  # GraphQL schema (generated by backend, read by Relay)
relay.config.json               # Relay compiler config (artifactDirectory: __generated__)
next.config.mjs                 # Next.js config (standalone output, Relay compiler, SVG loader, intl)
tailwind.config.ts              # TailwindCSS config (includes @filigran/ui paths)
components.json                 # shadcn/ui component config
vitest.config.ts                # Vitest config (jsdom, react plugin, relay plugin)
setup-vitest.ts                 # Vitest setup (jest-dom matchers, cleanup)
eslint.config.mjs               # ESLint config (next/core-web-vitals + prettier)
.lintstagedrc.js                # Lint-staged config (next lint + prettier per file)
test.Dockerfile                 # Docker image for running unit tests in CI
Dockerfile                      # Production Docker image (standalone Next.js)
```

### Path Aliases (Frontend)

- `@/*` → `./src/*`
- `@generated/*` → `./__generated__/*`

### E2E Tests — `apps/portal-e2e-tests/`

```
tests/
  fixtures/                     # Playwright fixtures
  model/                        # Page object models
  db-utils/                     # Database utilities for test setup/teardown
  utils/                        # Test helpers
  webhooks/                     # Notification webhook for test reporting
  tests_files/                  # Test data files
  __screenshots__/              # Visual regression screenshots
playwright.config.ts            # Playwright config (setup/teardown projects, chromium, ctrf reporter)
Dockerfile                      # E2E test Docker image
```

## Database

- **SQL Query Builder**: Knex.js 3 with PostgreSQL (`pg` driver) — not an ORM
- **Config**: `node-config` library reads from `apps/backend/config/` JSON files. Environment variables override via `custom-environment-variables.json`.
- **Migrations**: JavaScript files in `src/migrations/`. Run with `yarn migrate:latest`.
- **Seeds**: In `src/seeds/` (production) and `tests/seeds/` (test).
- **Test DB**: When `VITEST_MODE=true`, uses `test_database` database and `tests/seeds/` directory.
- **Connection**: `knexconfig.ts` defines base config, `knexfile.ts` extends it with migrations/seeds paths + security layer + pagination.

### Database Access Pattern

The `db()` function from `knexfile.ts` is the primary database accessor. It:
- Accepts a `DatabaseType` (table name)
- Supports pagination via `paginate()`
- Uses `databaseContext` (AsyncLocalStorage) for implicit transaction support

## Authentication & Security

- **Auth providers**: OIDC (via `openid-client`), Local (form-based)
- **Session**: `express-session` with PostgreSQL or memory store
- **GraphQL auth**: Custom `@auth` directive transformer in `src/security/directive-graphql/`
- **Frontend proxy**: Next.js `middleware.ts` proxies `/graphql-api`, `/graphql-sse`, `/auth/*`, `/document/*` to the backend API via `SERVER_HTTP_API` env var (default: `http://localhost:4002`)
- **Subscriptions**: GraphQL SSE via `graphql-sse` on `/graphql-sse`

## UI Component System

- **Design system**: `@filigran/ui` is Filigran's in-house React component library, built to match our design system. **Always use `@filigran/ui` components first** for any UI work (buttons, inputs, tables, dialogs, etc.). Only fall back to raw TailwindCSS or shadcn/ui primitives when `@filigran/ui` does not provide the needed component.
- **Icons**: `@filigran/icon` (Filigran's icon set) + `lucide-react` as fallback
- **Styling**: TailwindCSS 3 with `@filigran/ui`'s Tailwind plugin (`FiligranUIPlugin` in `tailwind.config.ts`)
- **Forms**: `react-hook-form` + `zod` validation (zod v4)
- **Markdown**: `@uiw/react-md-editor`

## CI/CD Pipeline

Main workflow: `.github/workflows/dockerbuild-ci.yml`

Triggered on pushes to `main`/`development`, tags `v*`, and PRs to `main`/`development`/`issue/*` — only when `apps/**`, the workflow file, `package.json`, or `yarn.lock` change.

### Job Sequence

1. **build-images-tests** (10 min) — Builds 5 Docker images in parallel: `portal-front`, `portal-api`, `portal-e2e-tests`, `portal-front-test`, `portal-api-test`
2. **run-e2e-tests** (20 min) — Playwright E2E via `docker-compose-ci.yml`
3. **run-front-unit-tests** (10 min) — Frontend Vitest in Docker container
4. **run-api-unit-tests** (10 min) — Backend Vitest via docker-compose (needs PostgreSQL + MinIO)
5. **deploy-feature-branch** — Deploys an ephemeral preview environment at `https://dev-pr-{number}.hub.staging.filigran.io` after tests pass, for every PR **unless** the `skip-feature-env` label is present (opt-out)
6. **build-images-prod** — Production images (after all tests pass, only on main/development/tags)
7. **deploy** — AWX deployment to staging/production

### Feature Environment (opt-out)

A preview environment is automatically created for every PR when CI passes. To skip it:
- Add the `skip-feature-env` label to the PR before or after CI runs
- The PR checklist includes a reminder for this

Behaviour controlled by label:

| Label | Feature env deployed? | "Ready for merging" auto-set? |
|---|---|---|
| *(none)* | ✅ Yes (default) | ❌ No — requires manual testing first |
| `skip-feature-env` | ❌ No | ✅ Yes — once checks + approval pass |

Removing the `skip-feature-env` label from an already-open PR triggers an immediate re-deployment via `.github/workflows/pr-issue-automation.yml`.

### CI Requirement

Before Docker builds, migrations and seeds are copied to e2e-tests:
```bash
cp -r ./apps/backend/src/migrations ./apps/portal-e2e-tests/migrations
cp -r ./apps/backend/tests/seeds ./apps/portal-e2e-tests/seeds
```

## Commit Convention

Format: `[package] <type>(<scope>): Message (#issueNumber)`

- **Package**: optional — omit entirely for CI, chores, or cross-cutting changes with no clear owner
- **Packages**: `frontend`, `backend`, `e2e-tests` — combinable with `/` for cross-package changes
- **Types**: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`
- **Scope**: optional component name

Examples:
- `[frontend] feat(custom-dashboards): add card component (#123)`
- `[backend] fix(login): handle missing auth token (#456)`
- `[frontend/backend] refactor(auth): extract shared token logic (#789)`
- `[e2e-tests] test(login): add SSO flow coverage (#202)`
- `chore(ci): update docker base image (#101)`

## Environment Variables

### Backend (via `custom-environment-variables.json`)

`DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_BASE`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET_NAME`, `MINIO_USE_SSL`, `ELASTIC_HOST`, `ELASTIC_PORT`, `NODE_ENV`, `VITEST_MODE`, `DATA_SEEDING`, `SESSION_STORE_TYPE`, `BASE_URL_FRONT`

### Frontend

`SERVER_HTTP_API` (default: `http://localhost:4002`), `E2E_BASE_URL` (default: `http://localhost:3002`), `NEXT_PUBLIC_APP_VERSION`

## Common Patterns

### Adding a New Backend Module

1. Create directory in `src/modules/<name>/`
2. Add `<name>.graphql` with type definitions, queries, mutations
3. Add `<name>.resolver.ts` with resolver implementations
4. Add `<name>.service.ts` with business logic
5. Register resolver in `src/server/graphql-schema.ts`
6. Run `yarn generate:ts` to update `src/__generated__/resolvers-types.ts`
7. The schema will be written to `apps/frontend/schema.graphql` on next API start (non-production)

### Adding a New Frontend Page

1. Create route in `app/(application)/app/(user)/` or `(admin)/admin/`
2. Create GraphQL query file (`*.graphql.ts`) using Relay's `graphql` tagged template
3. Run `yarn relay` to generate artifacts in `__generated__/`
4. Use `useLazyLoadQuery` or `usePreloadedQuery` from `react-relay`
5. Use `@/*` path alias for `src/` imports, `@generated/*` for generated types

### Adding a Database Migration

```bash
cd apps/backend
yarn migrate:make <migration_name>    # creates JS file in src/migrations/
```

## Testing Patterns

Both apps use **Vitest**. Test files sit next to the source file they cover (`*.test.ts` / `*.test.tsx`).

### Prefer parametric tests with `it.each`

When multiple cases share the same assertion logic, always use the template-literal form of `it.each` instead of duplicating `it()` blocks. This keeps tests compact and the failure output readable.

```typescript
it.each`
  input        | expected
  ${'foo'}     | ${'FOO'}
  ${'bar'}     | ${'BAR'}
  ${''}        | ${''}
`('should uppercase "$input" to "$expected"', ({ input, expected }) => {
  expect(toUpper(input)).toBe(expected);
});
```

Rules:
- First row = column headers (used in the test name via `$columnName` interpolation)
- Each subsequent row = one test case
- Include a `description` column when the input/expected values alone are not self-explanatory (see example below)

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

### Extracting pure utility functions for testability

Avoid testing complex component internals directly. Prefer extracting logic into a **pure utility function** in a `*.utils.ts` file alongside the component, then unit-test the utility in isolation. The component simply calls the utility.

```
TrialsTab.tsx           ← calls formatCancellationReason()
trials-tab.utils.ts      ← pure function, no React/Relay deps
trials-tab.utils.test.ts ← fast, isolated unit tests
```

### Frontend test conventions

- Use `testRender` from `@/utils/test/test-render` to render components (wraps providers).
- Mock `next-intl` with `useTranslations: () => (key: string) => key` so tests assert on i18n keys.
- Mock `react-relay` mutations with `useMutation: () => [vi.fn(), {}]`.
- Mock heavy UI components (e.g. `DataTable`) with simple `<div>` stubs when not under test.
- Use `createMockEnvironment()` from `relay-test-utils` for Relay queries.

### Backend test conventions

- Integration tests hit a real `test_database` PostgreSQL instance (set when `VITEST_MODE=true`).
- Use `describe` blocks to group by function/method, nest a second level for scenario groups.
- Prefer `expect.any(Date)` / `expect.objectContaining()` for dynamic values.

## Pitfalls

- **Yarn version mismatch**: Always `corepack enable` first
- **Missing Relay artifacts**: Run `yarn relay` before build or after GraphQL changes
- **E2E test failures**: Ensure frontend (:3002) and backend (:4002) are running
- **TypeScript ESLint warning** about TS 5.9.3 vs supported <5.9.0: non-blocking, ignore it
- **Frontend port**: Dev runs on 3002, Docker production runs on 3000 internally
- **Test DB**: Backend tests use `test_database` DB (not `cloud-portal`) when `VITEST_MODE=true`
- **Pre-commit hook**: Runs `lint-staged` in both backend and frontend sequentially
