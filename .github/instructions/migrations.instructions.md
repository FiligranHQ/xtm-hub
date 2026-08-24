---
applyTo: 'apps/backend/src/migrations/**,apps/backend/src/es-migrations/**,apps/backend/src/seeds/**,apps/backend/tests/seeds/**'
---

# Migration Instructions

Migrations are append-only history. Once a migration has run anywhere beyond your machine, never edit it — write a
new one.

## Postgres (Knex)

Live in `apps/backend/src/migrations/` as **JavaScript** files, not TypeScript. They are copied verbatim by the
backend `copy` build step, so keep them dependency-free and self-contained.

```bash
cd apps/backend
yarn migrate:make <migration_name>   # scaffold
yarn migrate:latest                  # apply
yarn migrate:up                      # one step forward
yarn migrate:down                    # one step back
```

Rules:

- Export both `up` and `down`. A migration without a working `down` blocks rollback for everyone.
- Match the numbering and naming of the surrounding files.
- Do not import application code or `db()` — migrations receive their own `knex` instance.
- Data backfills belong in a separate migration from schema changes, so a slow backfill cannot hold a schema lock.
- Adding a column to a large table: add it nullable, backfill, then add the constraint.
- Regenerate the kanel types in `apps/backend/src/model/kanel/` (`yarn generate-pg-to-ts`) after a schema change.

## Elasticsearch

Live in `apps/backend/src/es-migrations/`, scaffolded from
`src/thirdparty/elasticsearch/migration-template.js`.

```bash
cd apps/backend
yarn esmigrate:make <name>
yarn esmigrate:up
yarn esmigrate:down
```

Rules:

- Mapping changes are not free: adding a field is fine, changing an existing field's type requires a reindex.
- Make migrations idempotent — check whether the index or alias exists before creating it.
- Prefer alias swaps over in-place mutation when reindexing, so reads stay available.

## Seeds

Production seeds are in `apps/backend/src/seeds/`, test seeds in `apps/backend/tests/seeds/`. When `VITEST_MODE=true`
the backend targets `test_database` and the test seed directory. Adding a new required table usually means updating
the test seeds too, or integration tests will fail on missing fixtures.

## CI coupling

Before the Docker builds, CI copies migrations and seeds into the e2e image:

```bash
cp -r ./apps/backend/src/migrations ./apps/e2e/migrations
cp -r ./apps/backend/tests/seeds ./apps/e2e/seeds
```

A migration that only works when run from `apps/backend` will break the e2e job.
