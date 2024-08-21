/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table('Service', function (table) {
    table
      .enum('joining', ['SELF_JOIN', 'AUTO_JOIN', 'ASK_TO_JOIN'])
      .defaultTo('AUTO_JOIN');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table('Service', function (table) {
    table.dropColumn('joining');
  });
}
