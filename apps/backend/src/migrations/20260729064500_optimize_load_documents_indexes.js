/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_document_children_child_document_id
    ON "Document_Children" ("child_document_id")
  `);

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_document_load_documents_updated
    ON "Document" (
      "service_instance_id",
      "type",
      "active",
      "updated_at" DESC,
      "created_at" DESC
    )
  `);

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_document_load_documents_created
    ON "Document" (
      "service_instance_id",
      "type",
      "active",
      "created_at" DESC
    )
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw(`DROP INDEX IF EXISTS idx_document_load_documents_created`);
  await knex.raw(`DROP INDEX IF EXISTS idx_document_load_documents_updated`);
  await knex.raw(
    `DROP INDEX IF EXISTS idx_document_children_child_document_id`
  );
}
