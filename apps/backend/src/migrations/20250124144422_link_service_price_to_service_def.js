/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table('Service_Price', function (table) {
    table.dropColumn('service_instance_id');
    table
      .uuid('service_definition_id')
      .references('id')
      .inTable('ServiceDefinition')
      .onDelete('CASCADE');
  });
}
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table('Service_Price', function (table) {
    table.string('service_instance_id');
    table.dropColumn('service_definition_id');
  });
}
