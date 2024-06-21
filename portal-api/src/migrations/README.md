Knex migrations doesnt support correctly ESM and typescript for now.
Migrations must be defined as pure JS for this reason.

## How to create a DB migration

- Run "yarn knex:run migrate:make my_modif_name". It will create a migration file in the src/migrations.
- Fill this file with `export async function up` and `export async function down`
- On you first launch of portail-api, it will update the DB. It will insert a new entry in the `migrations` table.
- Generate the Ts files with `yarn generate-pg-to-ts` or `npx kanel` (remove the `type: module` from
  portal-api/package.json before launching the commands since it is not compatible)
- Please think about update your graphQL, your models etc.
