/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  if (await knex.schema.hasColumn('Document', 'entity_types')) return;
  await knex.schema.alterTable('Document', (table) => {
    table.specificType('entity_types', 'text[]').nullable().defaultTo('{}');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  if (!(await knex.schema.hasColumn('Document', 'entity_types'))) return;
  await knex.schema.alterTable('Document', (table) => {
    table.dropColumn('entity_types');
  });
}
