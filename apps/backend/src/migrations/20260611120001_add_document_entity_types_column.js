/**
 * Adds the `entity_types` column to Document. Used by OpenCTI Custom Views to
 * store the applicable OpenCTI entity types (Attack-Pattern, Campaign, ...).
 * Entity types are a fixed enum, so they are stored as a text[] column directly
 * (same approach as ServiceInstance.tags) rather than in a junction table.
 *
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
