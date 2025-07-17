/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('Subscription', (table) => {
    table.uuid('id', { primaryKey: true });
    table
      .uuid('organization_id')
      .references('id')
      .inTable('Organization')
      .onDelete('CASCADE');
    table
      .uuid('service_id')
      .references('id')
      .inTable('Service')
      .onDelete('CASCADE');
    table.date('start_date');
    table.date('end_date');
  });
  await knex.schema.table('Service', function (table) {
    table
      .enum('subscription_type', [
        'SUBSCRIPTABLE_DIRECT',
        'SUBSCRIPTABLE_BACKOFFICE',
      ])
      .defaultTo('SUBSCRIPTABLE_BACKOFFICE');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('Subscription');
  await knex.schema.table('Service', function (table) {
    table.dropColumn('subscription_type');
  });
}
