/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('SolutionCategory', (table) => {
    table.uuid('id', { primaryKey: true }).defaultTo(knex.fn.uuid());
    table.string('name').notNullable();
    table.specificType('product', 'text[]').notNullable().defaultTo('{}');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('SolutionCategory');
}
