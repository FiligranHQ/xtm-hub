/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('SEO_ServiceInstance', (table) => {
    table
      .uuid('service_instance_id')
      .notNullable()
      .references('id')
      .inTable('ServiceInstance')
      .onDelete('CASCADE');
    table.string('meta_title', 155).notNullable();
    table.string('meta_description', 155).notNullable();
    table.enu('language', ['en', 'fr', 'ja']).notNullable();
    table.primary(['service_instance_id', 'language']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('SEO_ServiceInstance');
}
