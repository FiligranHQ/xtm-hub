/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table('Subscription', function (table) {
    table.renameColumn('service_id', 'service_instance_id');
  });
  await knex.schema.table('Document', function (table) {
    table.renameColumn('service_id', 'service_instance_id');
  });
  await knex.schema.table('Service_Link', function (table) {
    table.renameColumn('service_id', 'service_instance_id');
  });
  await knex.schema.table('Service_Price', function (table) {
    table.renameColumn('service_id', 'service_instance_id');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table('Subscription', function (table) {
    table.renameColumn('service_instance_id', 'service_id');
  });
  await knex.schema.table('Document', function (table) {
    table.renameColumn('service_instance_id', 'service_id');
  });
  await knex.schema.table('Service_Link', function (table) {
    table.renameColumn('service_instance_id', 'service_id');
  });
  await knex.schema.table('Service_Price', function (table) {
    table.renameColumn('service_instance_id', 'service_id');
  });
}
