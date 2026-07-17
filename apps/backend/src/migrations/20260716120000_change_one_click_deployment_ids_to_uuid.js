/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw(
    'ALTER TABLE "OneClickDeployment" ALTER COLUMN platform_id TYPE uuid USING platform_id::uuid'
  );
  await knex.raw(
    'ALTER TABLE "OneClickDeployment" ALTER COLUMN tenant_id TYPE uuid USING tenant_id::uuid'
  );
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw(
    'ALTER TABLE "OneClickDeployment" ALTER COLUMN platform_id TYPE text USING platform_id::text'
  );
  await knex.raw(
    'ALTER TABLE "OneClickDeployment" ALTER COLUMN tenant_id TYPE text USING tenant_id::text'
  );
}
