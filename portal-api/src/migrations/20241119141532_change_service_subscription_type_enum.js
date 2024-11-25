/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table('Service', function (table) {
    table.dropColumn('subscription_service_type');
    table
      .enum('join_type', ['JOIN_INVITE', 'JOIN_ASK', 'JOIN_AUTO', 'JOIN_SELF'])
      .defaultTo('JOIN_INVITE');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table('Service', function (table) {
    table
      .enum('subscription_service_type', [
        'SUBSCRIPTABLE_DIRECT',
        'SUBSCRIPTABLE_BACKOFFICE',
        'SUBSCRIPTABLE_CREATION_NEEDED',
        'COMMUNITY',
      ])
      .defaultTo('SUBSCRIPTABLE_BACKOFFICE');
    table.dropColumn('join_type');
  });
}
