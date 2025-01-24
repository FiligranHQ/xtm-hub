/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table('ServiceDefinition', function (table) {
    table.string('route_name');
  });

  await knex('ServiceDefinition')
    .where({ name: 'Vault' })
    .update({ route_name: 'vault' });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table('ServiceDefinition', function (table) {
    table.dropColumn('route_name');
  });
}
