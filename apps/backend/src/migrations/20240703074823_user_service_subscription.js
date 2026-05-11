/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('User_Service', (table) => {
    table.uuid('id', { primaryKey: true });
    table.uuid('user_id').references('id').inTable('User').onDelete('CASCADE');
    table
      .uuid('subscription_id')
      .references('id')
      .inTable('Subscription')
      .onDelete('CASCADE');
    table.json('service_personal_data');
  });

  await knex.schema.createTable('Service_Capability', (table) => {
    table.uuid('id', { primaryKey: true });
    table
      .uuid('user_service_id')
      .references('id')
      .inTable('User_Service')
      .onDelete('CASCADE');
    table
      .enum('service_capability_name', [
        'ADMIN_SUBSCRIPTION',
        'MANAGE_ACCESS',
        'ACCESS_SERVICE',
      ])
      .defaultTo('ACCESS_SERVICE');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('User_Service');
  await knex.schema.dropTable('Service_Capability');
}
