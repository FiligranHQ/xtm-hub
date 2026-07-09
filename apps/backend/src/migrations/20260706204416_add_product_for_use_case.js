/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.alterTable('UseCase', (table) => {
    table.specificType('product', 'text[]').notNullable().defaultTo('{}');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.alterTable('UseCase', (table) => {
    table.dropColumn('product');
  });
}
