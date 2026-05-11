/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.dropTable('MessageTracking');
  await knex.schema.dropTable('ActionTracking');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.createTable('ActionTracking', function (table) {
    table.uuid('id', { primaryKey: true });
    table.string('contextual_id');
    table.string('status');
    table.datetime('created_at');
    table.datetime('ended_at');
    table.string('type');
  });

  await knex.schema.createTable('MessageTracking', function (table) {
    table.uuid('id', { primaryKey: true });
    table.string('tracking_id');
    table.datetime('created_at');
    table.string('technical');
    table.string('type');
    table.string('tracking_info');
  });
}
