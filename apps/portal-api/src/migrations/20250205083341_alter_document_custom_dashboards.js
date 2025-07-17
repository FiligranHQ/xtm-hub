/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table('Document', function (table) {
    table
      .uuid('parent_document_id')
      .nullable()
      .references('id')
      .inTable('Document')
      .onDelete('CASCADE');
    table.string('name').nullable();
    table.timestamp('updated_at').nullable();
    table.uuid('updater_id').nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table('Document', function (table) {
    table.dropColumn('updater_id');
    table.dropColumn('updated_at');
    table.dropColumn('parent_document_id');
    table.dropColumn('name');
  });
}
