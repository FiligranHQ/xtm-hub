/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.dropTableIfExists('Service_Price');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
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
}
