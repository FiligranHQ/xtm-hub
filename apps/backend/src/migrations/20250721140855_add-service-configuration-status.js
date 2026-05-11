/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table('Service_Configuration', function (table) {
    table.enum('status', ['active', 'inactive']).defaultTo('active');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table('Service_Configuration', function (table) {
    table.dropColumn('status');
  });
}
