---
mode: agent
description: Create and apply a Knex Postgres migration, then regenerate the kanel types.
---

# Add a database migration

Add a Postgres schema change under `apps/backend/src/migrations/`.

Ask me what the schema change is if I have not described it.

## Steps

1. **Scaffold**: `yarn workspace @xtm-hub/backend migrate:make <migration_name>`. This writes a **JavaScript** file —
   migrations are copied verbatim by the build, so keep them dependency-free and never convert one to TypeScript.

2. **Implement `up` and `down`.** Both are mandatory; a migration without a working `down` blocks rollback for
   everyone. Use the `knex` instance passed in — never import `db()` or any application code.

3. **Split schema from data.** Put a backfill in its own migration so a slow data pass cannot hold a schema lock.
   For a new column on a large table: add it nullable, backfill, then add the constraint.

4. **Apply**: `yarn workspace @xtm-hub/backend migrate:latest`. Requires the local infrastructure
   (`docker compose -f xtm-hub-dev/docker-compose.yml up`).

5. **Verify the rollback** actually works: `yarn workspace @xtm-hub/backend migrate:down` then `migrate:up` again.

6. **Regenerate types**: `yarn workspace @xtm-hub/backend generate-pg-to-ts`, which refreshes
   `apps/backend/src/model/kanel/`. Commit the result; do not edit it by hand.

7. **Seeds.** If the change adds a required column or table, update `apps/backend/tests/seeds/` or integration tests
   will fail on missing fixtures. Production seeds live in `apps/backend/src/seeds/`.

8. **Validate**: `yarn workspace @xtm-hub/backend test:ci`.

## Constraints

- Migrations are append-only. Once one has run outside your machine, never edit it — write a new one.
- Match the numbering and naming of the surrounding files.
- CI copies `apps/backend/src/migrations` into `apps/e2e/` before the Docker build, so a migration that only works
  `apps/backend` will break the e2e job.

For an Elasticsearch mapping change, use `yarn workspace @xtm-hub/backend esmigrate:make <name>` instead and follow
[`migrations.instructions.md`](../instructions/migrations.instructions.md) — mapping type changes need a reindex, and
migrations must be idempotent.

Summarise the schema change, confirm the rollback works, and flag anything that needs coordinated deployment.
