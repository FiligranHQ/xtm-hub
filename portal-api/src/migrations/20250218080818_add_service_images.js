/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table('ServiceInstance', function (table) {
    table
      .uuid('logo_document_id')
      .nullable()
      .references('id')
      .inTable('Document');
    table.uuid('illustration_document_id').nullable().references('id');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table('ServiceInstance', function (table) {
    table.dropColumn('logo_document_id');
    table.dropColumn('illustration_document_id');
  });
}
