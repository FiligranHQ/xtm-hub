/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  /*await knex.schema.alterTable('Document', function (table) {
    table.string('type').notNullable().alter();
  });*/

  await knex.raw(`
    INSERT INTO "Document_Children" ("parent_document_id", "child_document_id")
    SELECT "parent_document_id", "id"
    FROM "Document"
    WHERE "parent_document_id" IS NOT NULL
  `);

  await knex.schema.table('Document', function (table) {
    table.dropColumn('parent_document_id');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table('Document', function (table) {
    table.uuid('parent_document_id').nullable();
    table.foreign('parent_document_id').references('Document.id');
  });

  await knex.raw(`
    UPDATE "Document" d
    SET "parent_document_id" = dc."parent_document_id"
    FROM "Document_Children" dc
    WHERE d."id" = dc."child_document_id"
  `);

  await knex.schema.alterTable('Document', function (table) {
    table.string('type').nullable().alter();
  });
}
