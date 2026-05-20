/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('User', (table) => {
    table.string('language', 8).notNullable().defaultTo('en');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('User', (table) => {
    table.dropColumn('language');
  });
}
