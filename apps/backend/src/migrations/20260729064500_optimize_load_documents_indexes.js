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
    CREATE INDEX IF NOT EXISTS idx_document_service_instance_type
    ON "Document" ("service_instance_id", "type")
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw(`DROP INDEX IF EXISTS idx_document_service_instance_type`);
  await knex.raw(
    `DROP INDEX IF EXISTS idx_document_children_child_document_id`
  );
}
