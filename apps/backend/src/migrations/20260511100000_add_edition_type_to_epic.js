/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.alterTable('Epic', function (table) {
    table
      .enum('edition_type', [
        'enterprise_edition',
        'partial_ee',
        'community_edition',
      ])
      .notNullable()
      .defaultTo('community_edition');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.alterTable('Epic', function (table) {
    table.dropColumn('edition_type');
  });
}
