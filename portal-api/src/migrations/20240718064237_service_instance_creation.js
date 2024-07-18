/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table('Subscription', function (table) {
    table.uuid('subscriber_id').references('id').inTable('User');
  });

  await knex.schema.table('Service', function (table) {
    table
      .enum('creation_status', ['READY', 'PENDING', 'DISABLED'])
      .defaultTo('READY');
    // table.dropColumn('subscription_type');
    table
      .enum('subscription_service_type', [
        'SUBSCRIPTABLE_DIRECT',
        'SUBSCRIPTABLE_BACKOFFICE',
        'SUBSCRIPTABLE_CREATION_NEEDED',
        'COMMUNITY',
      ])
      .defaultTo('SUBSCRIPTABLE_BACKOFFICE');
  });

  await knex.schema.createTable('Service_Link', (table) => {
    table.uuid('id', { primaryKey: true }).defaultTo(knex.fn.uuid());
    table
      .uuid('service_id')
      .references('id')
      .inTable('Service')
      .onDelete('CASCADE');
    table.string('url');
    table.string('name');
  });

  await knex.schema.createTable('Service_Price', (table) => {
    table.uuid('id', { primaryKey: true }).defaultTo(knex.fn.uuid());
    table
      .uuid('service_id')
      .references('id')
      .inTable('Service')
      .onDelete('CASCADE');
    table.enum('fee_type', ['MONTHLY', 'YEARLY']).defaultTo('MONTHLY');
    table.date('start_date');
    table.integer('price');
  });
  await knex.schema.dropTable('ServicePrice');
  await knex.schema.table('Service', function (table) {
    table.dropColumn('url');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('Service_Price');
  await knex.schema.dropTable('Service_Link');
  await knex.schema.table('Service', function (table) {
    table.dropColumn('creation_status');
  });
  await knex.schema.table('Subscription', function (table) {
    table.dropColumn('subscriber_id');
  });
  await knex.schema.table('Service', function (table) {
    table.dropColumn('subscription_service_type');
  });
}
