/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table('Subscription', function (table) {
    table
      .enum('joining', ['SELF_JOIN', 'AUTO_JOIN', 'ASK_TO_JOIN'])
      .defaultTo('AUTO_JOIN');
    table.integer('billing').defaultTo(100);
    table.dropColumn('subscriber_id');
  });
  await knex.schema.table('Service', function (table) {
    table.dropColumn('joining');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table('Subscription', function (table) {
    table.dropColumn('billing');
    table.dropColumn('joining');
  });
}
