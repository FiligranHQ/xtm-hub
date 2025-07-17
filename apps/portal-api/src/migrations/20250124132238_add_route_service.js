/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table('ServiceDefinition', function (table) {
    table.string('identifier');
  });

  await knex('ServiceDefinition')
    .where({ name: 'Vault' })
    .update({ identifier: 'vault' });

  await knex('ServiceDefinition')
    .where({ name: 'Link' })
    .update({ identifier: 'link' });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table('ServiceDefinition', function (table) {
    table.dropColumn('identifier');
  });
}
