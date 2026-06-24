/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('Document', (table) => {
    table.boolean('is_decommissioned').notNullable().defaultTo(false);
    table.text('version').nullable();
    table.specificType('tags', 'text[]').notNullable().defaultTo('{}');
  });
}

/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('Document', (table) => {
    table.dropColumn('tags');
    table.dropColumn('version');
    table.dropColumn('is_decommissioned');
  });
}
