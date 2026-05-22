/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table('Service', function (table) {
    table.string('url').defaultTo('http://example.com');
    table.string('provider').defaultTo('SCRED');
    table.string('type').defaultTo('Intel');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table('Service', function (table) {
    table.dropColumn('url');
    table.dropColumn('provider');
    table.dropColumn('type');
  });
}
