# XTM Hub - Copilot Coding Instructions

## Repository Overview

XTM Hub is the **unified entry point** for Filigran's ecosystem, serving as a marketplace for resources, knowledge-sharing platform, and community engagement hub. This is a full-stack monorepo application built with TypeScript.

**Repository Size**: Medium (~1800 packages)
**Primary Languages**: TypeScript, JavaScript
**Architecture**: Monorepo with Yarn workspaces
**Main Applications**:
- `apps/portal-api`: Backend API (Node.js/Express/GraphQL/Apollo Server)
- `apps/portal-front`: Frontend UI (Next.js 15/React 19/Relay)
- `apps/portal-e2e-tests`: End-to-end tests (Playwright)

## Critical Setup Requirements

### Prerequisites
**Node.js**: v24.11.1 (specified in `.nvmrc`)
**Package Manager**: Yarn 4.12.0 via Corepack (NOT global yarn)

### Initial Setup (ALWAYS DO THIS FIRST)
```bash
# Enable Corepack (REQUIRED before any yarn commands)
corepack enable

# Install all dependencies from repository root
yarn install
```

**IMPORTANT**: The project uses `packageManager: "yarn@4.12.0"` in package.json. If you see errors about Yarn version mismatch, you MUST run `corepack enable` first. The global yarn (1.x) will NOT work.

### Yarn Configuration
- Uses Yarn 4 with node_modules linker (`.yarnrc.yml`)
- Build scripts disabled by default for security
- NPM packages must be at least 3 days old (npmMinimalAgeGate)
- Pre-approved packages: `@filigran/*`

## Development Workflow

### Starting Development Servers

**Backend API** (runs on port 4001):
```bash
yarn dev:api
# OR from apps/portal-api:
yarn dev
```

**Frontend** (runs on port 3002):
```bash
yarn dev:front
# OR from apps/portal-front:
yarn dev
```

**IMPORTANT**: Frontend depends on backend API. Always start the API first, or run services via Docker Compose.

### Using Docker Compose (Recommended for Full Stack)
Docker Compose files are located in `xtm-hub-dev/`:

**For local development**:
```bash
docker compose -f xtm-hub-dev/docker-compose.yml up
```

This starts:
- PostgreSQL (port 5434)
- MinIO (port 9002)
- Elasticsearch (port 9204)
- Kibana (port 5603)
- PgAdmin (port 8888)
- Mailpit (port 8025)

**For CI testing**:
```bash
# Used by GitHub Actions
docker compose -f xtm-hub-dev/docker-compose-ci.yml up
```

## Building and Testing

### Linting
**ALWAYS run linting before committing**. The repository uses ESLint with TypeScript.

```bash
# Lint API code
cd apps/portal-api
yarn lint

# Lint frontend code
cd apps/portal-front
yarn lint

# Auto-fix linting issues
yarn lint:fix
```

**Known Linting Warnings**: The frontend has React Hook exhaustive-deps warnings in several files. These are non-blocking but should not be introduced in new code.

### Type Checking
```bash
# Check TypeScript types without emitting files
cd apps/portal-api
yarn check-ts

cd apps/portal-front
yarn check-ts
```

### Testing

**Backend Unit Tests** (Vitest):
```bash
cd apps/portal-api
yarn test              # Run tests
yarn test:coverage     # With coverage
yarn test:w           # Watch mode
```

**Frontend Unit Tests** (Vitest):
```bash
cd apps/portal-front
yarn test              # Run tests
yarn test:coverage     # With coverage
yarn test:w           # Watch mode
```

**E2E Tests** (Playwright):
```bash
cd apps/portal-e2e-tests
yarn test:e2e          # Run all e2e tests
yarn test:e2e:ui       # Run with Playwright UI
```

**IMPORTANT**: E2E tests require both frontend and backend services to be running. They run on port 3002 for frontend and 4001 for API.

### Building

**Backend**:
```bash
cd apps/portal-api
yarn build             # Compiles TypeScript and copies GraphQL files
```

**Frontend**:
```bash
cd apps/portal-front
yarn relay             # Generate Relay artifacts (REQUIRED before build)
yarn build             # Next.js production build
```

**CRITICAL**: Frontend MUST run `yarn relay` before building to generate GraphQL types and Relay artifacts. The CI does this automatically.

## Repository Structure

### Root Files
- `package.json`: Root workspace configuration
- `tsconfig.json`: Base TypeScript config (extended by workspaces)
- `.nvmrc`: Node version specification
- `.yarnrc.yml`: Yarn 4 configuration
- `.husky/`: Git hooks (pre-commit runs lint-staged)
- `xtm-hub-dev/`: Docker Compose configurations

### Backend API (`apps/portal-api/`)
**Key Directories**:
- `src/index.ts`: Main entry point
- `src/modules/`: Feature modules (services, users, organizations, etc.)
- `src/migrations/`: Knex database migrations
- `src/es-migrations/`: Elasticsearch migrations
- `src/seeds/`: Database seed data
- `src/security/`: Authentication and authorization
- `src/thirdparty/`: Third-party integrations (Elasticsearch, MinIO, etc.)
- `src/__generated__/`: Auto-generated GraphQL TypeScript types
- `tests/`: Unit tests
- `config/`: Configuration files (default.json, production.json, etc.)

**Key Config Files**:
- `knexfile.ts`: Database migration configuration
- `codegen.yml`: GraphQL Code Generator config
- `vitest.config.ts`: Test configuration
- `eslint.config.mjs`: ESLint rules
- `.prettierrc`: Prettier formatting rules

**Database Commands**:
```bash
yarn migrate:latest    # Run migrations
yarn migrate:make <name>  # Create new migration
yarn esmigrate:up      # Run Elasticsearch migrations
```

### Frontend (`apps/portal-front/`)
**Key Directories**:
- `app/`: Next.js 15 app directory (routes and layouts)
- `src/components/`: React components
- `src/hooks/`: Custom React hooks
- `src/relay/`: Relay GraphQL client setup
- `__generated__/`: Relay-generated artifacts
- `messages/`: i18n translation files
- `public/`: Static assets

**Key Config Files**:
- `next.config.mjs`: Next.js configuration
- `relay.config.json`: Relay compiler config
- `tailwind.config.ts`: TailwindCSS config
- `vitest.config.ts`: Test configuration
- `eslint.config.mjs`: ESLint rules

**GraphQL Commands**:
```bash
yarn relay             # Compile Relay queries (REQUIRED after GraphQL changes)
yarn generate:enum     # Generate TypeScript enums from GraphQL
```

### E2E Tests (`apps/portal-e2e-tests/`)
- `tests/`: Playwright test files
- `playwright.config.ts`: Playwright configuration
- Test runs require migrations and seeds copied from portal-api

## CI/CD Pipeline

### Main Workflow: `.github/workflows/dockerbuild-ci.yml`

**Triggered on**:
- Push to `main`, `development`, or tags
- Pull requests to `main`, `development`, `issue/*`

**Job Sequence**:
1. **build-images-tests**: Builds 5 Docker images in parallel:
   - `portal-front`, `portal-api`, `portal-e2e-tests`
   - `portal-front-test`, `portal-api-test`
   
2. **run-e2e-tests**: Runs Playwright E2E tests (timeout: 20 min)
   - Uses docker-compose-ci.yml
   - Generates CTRF test reports
   - On failure: collects logs from all services

3. **run-front-unit-tests**: Frontend Vitest tests (timeout: 10 min)
   - Uploads coverage to Codecov

4. **run-api-unit-tests**: Backend Vitest tests (timeout: 10 min)
   - Uploads coverage to Codecov

5. **build-images-prod**: Production images (only after tests pass)
   - Builds `portal-front-prod` and `portal-api-prod`
   - Tags with version from git tag or commit SHA

6. **deploy**: Deploys to staging/production via AWX

**CRITICAL CI REQUIREMENT**: Before E2E tests run, migrations and seeds are copied:
```bash
cp -r ./apps/portal-api/src/migrations ./apps/portal-e2e-tests/migrations
cp -r ./apps/portal-api/tests/seeds ./apps/portal-e2e-tests/seeds
```

### Other Workflows
- `pr-issue-automation.yml`: PR/issue labeling and automation
- `notify-teams-pr-ready-testing.yml`: Teams notifications
- `test-feature-branch.yml`: Feature branch deployments
- `helmpackage.yml`: Helm chart packaging
- `deployment.yml`: Production deployments

## Commit Message Convention

**MUST follow this format**:
```
[package] <type>(<scope>): Message (#issueNumber)
```

**Allowed types**: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`
**Packages**: `frontend`, `backend`, `doc`
**Scope**: Optional component name

**Examples**:
- `[frontend] feat(custom dashboards): add card component (#123)`
- `[backend] fix(login): handle missing auth token (#456)`
- `[doc] docs: update README with installation steps (#789)`

## Common Pitfalls and Solutions

### Issue: Yarn version mismatch error
**Solution**: Run `corepack enable` before any yarn commands

### Issue: Frontend build fails with "Cannot find Relay artifacts"
**Solution**: Run `yarn relay` before `yarn build`

### Issue: E2E tests fail immediately
**Solution**: Ensure frontend (port 3002) and backend (port 4001) are running and healthy

### Issue: Database migration errors in tests
**Solution**: Check that `VITEST_MODE=true` is set, which uses test database configuration

### Issue: Docker build fails with "Cannot find migrations"
**Solution**: The CI workflow copies migrations before building. Locally, ensure migrations exist in expected paths.

### Issue: Linting fails on pre-commit
**Solution**: Run `yarn lint:fix` in the affected workspace (portal-api or portal-front)

### Issue: TypeScript version warning from ESLint
**Solution**: This is a known warning (TypeScript 5.9.3 vs supported <5.9.0). Non-blocking, do not upgrade TypeScript without testing.

## Environment Variables

### Backend (`apps/portal-api/`)
Key environment variables (see `src/config.ts`):
- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_BASE`
- `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET_NAME`
- `ELASTIC_HOST`, `ELASTIC_PORT`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `NODE_ENV`: development/production
- `VITEST_MODE`: Set to "true" for tests
- `DATA_SEEDING`: Set to "true" to seed database on startup

### Frontend (`apps/portal-front/`)
- `SERVER_HTTP_API`: Backend API URL (default: http://localhost:4001)
- `E2E_BASE_URL`: Frontend URL for E2E tests (default: http://localhost:3002)

## Best Practices

1. **Always enable Corepack first**: `corepack enable` before any yarn command
2. **Run from workspace root**: Use `yarn dev:api` or `yarn dev:front` from root, not `cd apps/...`
3. **Lint before commit**: Git hooks will enforce this, but run manually to catch issues early
4. **Type check regularly**: Run `yarn check-ts` in workspaces after changes
5. **Relay after GraphQL changes**: Always run `yarn relay` in portal-front after backend GraphQL changes
6. **Test locally before push**: Run unit tests in affected workspace
7. **Use Docker Compose for integration testing**: Start services with docker-compose.yml for full-stack testing
8. **Follow commit conventions**: PRs will fail automation if commit messages don't match format

## Trust These Instructions

These instructions have been validated through actual execution of commands, review of CI workflows, and examination of the codebase. If you encounter issues not covered here, they may indicate a genuine bug or environmental problem. Only search for additional information if these instructions are incomplete or incorrect for your specific case.
