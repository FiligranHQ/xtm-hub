/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Key-value store for durable platform-level metadata. First consumer is
  // the anonymous usage telemetry instance identity (instance_id +
  // instance_creation), which must survive restarts and upgrades so the hub
  // keeps reporting under the same id.
  await knex.schema.createTable('PlatformMetadata', (table) => {
    table.text('key').primary();
    table.text('value').notNullable();
  });
  await knex('PlatformMetadata').insert([
    { key: 'instance_id', value: knex.raw('gen_random_uuid()::text') },
    { key: 'instance_creation', value: new Date().toISOString() },
  ]);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('PlatformMetadata');
}
