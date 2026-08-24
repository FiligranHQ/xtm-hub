---
mode: agent
description: Scaffold a new backend GraphQL module (schema, resolver, service) and wire it into the server.
---

# Add a backend module

Create a new feature module under `apps/backend/src/modules/`.

Ask me for the module name and its domain (for example `deployment`, `document`, `security-management`) if I have not
already given them.

## Steps

1. **Scaffold.** Run `yarn workspace @xtm-hub/backend generate:module`, or mirror the shape produced by
   `apps/backend/src/scripts/generate-new-module.ts`. Place the directory alongside its siblings — nest it under the
   right domain rather than dropping it at the top of `modules/`.

2. **Schema** — `<name>.graphql`. Define the types, queries and mutations. Paginated fields must return a
   Connection using the shared types in `modules/common/`. Put access control on the field with the `@auth`
   directive; do not hand-roll checks in the resolver.

3. **Service** — `<name>.service.ts`. All business logic and data access. Use `db()` from `knexfile.ts`, which takes
   a `DatabaseType` and picks up the ambient transaction from `databaseContext`. Never open a connection directly.

4. **Resolver** — `<name>.resolver.ts`. Keep it thin: validate input, delegate to the service, map the result. Type
   it against `apps/backend/src/__generated__/resolvers-types.ts`.

5. **Register** the resolver in `apps/backend/src/server/graphql-schema.ts`. Without this the fields silently do not
   exist.

6. **Generate types**: `yarn workspace @xtm-hub/backend generate:ts`.

7. **Migration**, if the module needs new tables — see
   [`migrations.instructions.md`](../instructions/migrations.instructions.md). Regenerate the kanel types afterwards
   with `yarn workspace @xtm-hub/backend generate-pg-to-ts`.

8. **Tests** — colocate `<name>.service.test.ts`. Cover the empty, boundary and error paths, not just the happy path.
   Use `it.each` for cases that share assertion logic.

9. **Validate**: `yarn workspace @xtm-hub/backend test:ci`.

## Constraints

- Use `logApp` from `apps/backend/src/utils/app-logger.util.ts`. Never `console.log`.
- Read configuration through `apps/backend/src/config.ts`, never `process.env` directly.
- Do not edit `apps/backend/src/__generated__/` by hand.

Report which files you created, and whether the schema change requires me to run
`yarn workspace @xtm-hub/frontend relay`.
