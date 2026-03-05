/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.alterTable('Epic', function (table) {
    table.text('description').alter();
    table.renameColumn('is_active', 'active');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.alterTable('Epic', function (table) {
    table.string('description').alter();
    table.renameColumn('active', 'is_active');
  });
}
