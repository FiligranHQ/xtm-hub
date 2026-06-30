/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('ManifestRebuildQueue', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('product').notNullable();
    table.text('version').notNullable();
    table.text('type').notNullable();
    table.text('status').notNullable().defaultTo('pending');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.unique(['product', 'version', 'type', 'status']);
  });

  await knex.schema.createTable('Manifest', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('product').notNullable();
    table.text('version').notNullable();
    table.text('type').notNullable();
    table.text('name').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('Manifest_Document', (table) => {
    table
      .uuid('manifest_id')
      .notNullable()
      .references('id')
      .inTable('Manifest')
      .onDelete('CASCADE');
    table
      .uuid('document_id')
      .notNullable()
      .references('id')
      .inTable('Document');
    table.primary(['manifest_id', 'document_id']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('Manifest_Document');
  await knex.schema.dropTable('Manifest');
  await knex.schema.dropTable('ManifestRebuildQueue');
}
