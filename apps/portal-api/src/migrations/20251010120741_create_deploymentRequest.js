/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('DeploymentRequest', function (table) {
    table.uuid('id', { primaryKey: true });

    table
      .uuid('user_requester_id')
      .references('id')
      .inTable('User')
      .onDelete('CASCADE');
    table
      .uuid('organization_requester_id')
      .references('id')
      .inTable('Organization')
      .onDelete('CASCADE');
    table
      .uuid('service_instance_id')
      .references('id')
      .inTable('ServiceInstance');

    table.string('status');
    table.string('type');
    table.date('request_date');
    table.date('start_date');
    table.date('end_date');
    table.string('product_type');
    table.string('intention');
    table.string('region');
    table.string('activity_sector');

    table.string('platform_token');
    table.string('product_service_instance_id');
    table.string('failure_reason');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('DeploymentRequest');
}
