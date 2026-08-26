# AGENTS.md

Entry point for coding agents working in the XTM Hub repository.

XTM Hub is the unified entry point for Filigran's ecosystem — a marketplace for cybersecurity resources, a
knowledge-sharing platform, and a community engagement hub. It is a full-stack TypeScript monorepo on Yarn
workspaces.

| Workspace | Path | Stack | Dev port |
| --- | --- | --- | --- |
| `@xtm-hub/backend` | `apps/backend` | Express 5, Apollo Server, GraphQL, Knex, PostgreSQL, Elasticsearch, MinIO | 4002 |
| `@xtm-hub/frontend` | `apps/frontend` | Next.js 16 (App Router), React 19, `@tanstack/react-query` (preferred for new data fetching) + Relay (existing pages), TailwindCSS 4, `@filigran/ui` | 3002 |
| `@xtm-hub/test_e2e` | `apps/e2e` | Playwright | — |

## Setup

```bash
corepack enable   # REQUIRED — the global yarn 1.x will not work
yarn install      # from the repo root
```

`corepack enable` must run before **any** yarn command. Node comes from `.nvmrc`, Yarn from the `packageManager`
field in the root `package.json`.

Local infrastructure (PostgreSQL, MinIO, Elasticsearch, Kibana, PgAdmin, Mailpit):

```bash
docker compose -f xtm-hub-dev/docker-compose.yml up
```

Dev servers: `yarn dev:api` (:4002), then `yarn dev:front` (:3002).

## Validation

Run the narrowest command that covers your change:

```bash
yarn workspace @xtm-hub/backend  test:ci   # check-ts + lint + tests
yarn workspace @xtm-hub/frontend test:ci   # lint + tests
```

Backend tests need PostgreSQL and MinIO running, target `test_database` via `VITEST_MODE=true`, and execute with
`fileParallelism: false`. E2E tests need the frontend and backend already running.

Only run linters, builds and tests that already exist; do not add new tooling unless the task requires it.

## Critical rules

- **No `console.log`.** Use `logApp` from `apps/backend/src/utils/app-logger.util.ts` on the backend. `console.warn`
  and `console.error` are allowed only in scripts and launch code outside the running app.
- **Prefix unused variables with `_`.**
- **Comment only what needs clarifying.**
- **Never edit generated output**: `apps/frontend/__generated__/`, `apps/frontend/schema.graphql`,
  `apps/backend/src/__generated__/`, `apps/backend/src/model/kanel/`.
- **Never hardcode versions in documentation** — reference `.nvmrc`, `packageManager`, or the `catalog` block in
  `.yarnrc.yml`.
- **Use `@filigran/ui` first** for any frontend UI work; fall back to Tailwind or shadcn primitives only when it has
  no equivalent.
- **After any GraphQL change**, run `yarn workspace @xtm-hub/backend generate:ts` **and**
  `yarn workspace @xtm-hub/frontend relay`.
- **Before frontend `check-ts` on a fresh checkout**, run `yarn workspace @xtm-hub/frontend next typegen`.
  `next-env.d.ts` is generated and gitignored; without it you get bogus `@public/*.svg` module errors.

## Commits and pull requests

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) with a GitHub issue reference:

```
type(scope?)!?: description (#issue)
```

Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`. The description
starts lowercase with no trailing period. Pull request titles **must** end with the issue reference, every pull
request must be linked to an issue, and commits must be signed. See [`.github/LABELS.md`](.github/LABELS.md) for the
full taxonomy.

## Detailed instructions

This file is the portable summary. The authoritative, path-scoped guidance lives in:

- [`.github/copilot-instructions.md`](.github/copilot-instructions.md) — shared repository context
- [`.github/instructions/`](.github/instructions/) — per-area rules applied by path
  (`backend`, `frontend`, `e2e`, `graphql`, `migrations`, `testing`, `ci`)
- [`.github/skills/`](.github/skills/) — task-specific playbooks
- [`.github/agents/`](.github/agents/) — specialised agent definitions
- [`.github/prompts/`](.github/prompts/) — repeatable recipes for common changes

Read the file matching the area you are touching before making changes. To review AI instructions/docs/agents/skills
for drift, use the `hub-review` skill (`.github/skills/hub-review/SKILL.md`) rather than guessing.
