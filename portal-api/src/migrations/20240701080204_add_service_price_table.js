export async function up(knex) {
  await knex.schema.createTable('ServicePrice', (table) => {
    table.uuid('id', { primaryKey: true });
    table.integer('price');
    table.enum('type', ['MONTHLY', 'YEARLY']).defaultTo('YEARLY');
    table
      .uuid('service_id')
      .references('id')
      .inTable('Service')
      .onDelete('CASCADE');
    table.string('description');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('ServicePrice');
}
