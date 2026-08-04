/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw(
    'ALTER TABLE "OneClickDeployment" ALTER COLUMN resource_id TYPE uuid USING resource_id::uuid'
  );
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw(
    'ALTER TABLE "OneClickDeployment" ALTER COLUMN resource_id TYPE text USING resource_id::text'
  );
}
