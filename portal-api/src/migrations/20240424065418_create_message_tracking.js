/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Create action tracking table
  await knex.schema.createTable('MessageTracking', (table) => {
    table.uuid('id', { primaryKey: true }).defaultTo(knex.fn.uuid());
    table.uuid('tracking_id').references('id').inTable('ActionTracking')
      .onDelete('CASCADE');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.boolean('technical').defaultTo(false);
    table.string('type').notNullable();
    table.json('tracking_info');
  });

  await knex.schema.table('ActionTracking', function(table) {
    table.dropColumn('type');
    table.dropColumn('output');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('ended_at');
  });

};

/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('MessageTracking');
  await knex.schema.table('ActionTracking', function(table) {
    table.string('output');
    table.string('type').notNullable();
    table.dropColumn('created_at');
    table.dropColumn('ended_at');
  });
};
