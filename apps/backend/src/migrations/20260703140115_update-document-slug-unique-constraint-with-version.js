/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Suffix the slug of duplicate rows sharing the same type, slug and version,
  // keeping the oldest row (by created_at) untouched
  await knex.raw(`
    UPDATE "Document" d
    SET slug = d.slug || '-' || (ranked.rn - 1)
    FROM (
      SELECT id, ROW_NUMBER() OVER (
        PARTITION BY type, slug, version ORDER BY created_at ASC
      ) AS rn
      FROM "Document"
      WHERE type IS NOT NULL AND slug IS NOT NULL AND version IS NOT NULL
    ) ranked
    WHERE d.id = ranked.id AND ranked.rn > 1
  `);

  await knex.schema.alterTable('Document', (table) => {
    // Drop the previous unique index on type and slug
    table.dropUnique(['type', 'slug'], 'document_type_slug_unique');

    // Create the unique index on type, slug and version
    table.unique(['type', 'slug', 'version'], {
      indexName: 'document_type_slug_version_unique',
    });
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('Document', (table) => {
    // Drop the unique index on type, slug and version
    table.dropUnique(
      ['type', 'slug', 'version'],
      'document_type_slug_version_unique'
    );

    // Restore the previous unique index on type and slug
    table.unique(['type', 'slug'], {
      indexName: 'document_type_slug_unique',
    });
  });
}
