/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable('Epic', function (table) {
    table.uuid('id', { primaryKey: true }).defaultTo(knex.fn.uuid());
    table.string('epic').notNullable();
    table.string('title').notNullable();
    table.boolean('is_active').defaultTo(false);
    table.uuid('uploader_id');
    table.string('short_description').notNullable();
    table.string('description').notNullable();
    table.string('product').notNullable();
    table
      .enum('timeline', ['now', 'next', 'under_consideration'])
      .defaultTo('Now');
    table.enum('epic_type', ['integration', 'other']).defaultTo('other');
    table.uuid('document_id').references('id').inTable('Document');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').nullable();
    table.uuid('updater_id').nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists('Epic');
}
