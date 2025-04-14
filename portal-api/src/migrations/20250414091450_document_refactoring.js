/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table('Document', function (table) {
    table.string('type');
  });

  await knex.raw(`
    UPDATE "Document"
    SET type = CASE
      WHEN "ServiceDefinition".identifier = 'custom_dashboards' THEN 'custom_dashboard'
      ELSE "ServiceDefinition".identifier
    END
    FROM "ServiceInstance"
    JOIN "ServiceDefinition" ON "ServiceInstance".service_definition_id = "ServiceDefinition".id
    WHERE "Document".service_instance_id = "ServiceInstance".id
  `);

  await knex.schema.createTable('Document_Children', function (table) {
    table.uuid('parent_document_id').notNullable();
    table.uuid('child_document_id').notNullable();

    table.primary(['parent_document_id', 'child_document_id']);

    table
      .foreign('parent_document_id')
      .references('Document.id')
      .onDelete('CASCADE');
    table
      .foreign('child_document_id')
      .references('Document.id')
      .onDelete('CASCADE');

    table.index('parent_document_id');
  });

  await knex.schema.createTable('Document_Metadata', function (table) {
    table.uuid('document_id').notNullable();
    table.string('key').notNullable();
    table.text('value');

    table.primary(['document_id', 'key']);

    table.foreign('document_id').references('Document.id').onDelete('CASCADE');

    table.index('document_id');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('Document_Children');
  await knex.schema.dropTableIfExists('Document_Metadata');

  await knex.schema.table('Document', function (table) {
    table.dropColumn('type');
  });
}
