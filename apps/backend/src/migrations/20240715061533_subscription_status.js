/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table('Subscription', function (table) {
    table
      .enum('status', ['REQUESTED', 'ACCEPTED', 'REFUSED'])
      .defaultTo('ACCEPTED');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table('Subscription', function (table) {
    table.dropColumn('status');
  });
}
