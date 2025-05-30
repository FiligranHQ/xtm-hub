/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Find duplicates based on type and slug
  const duplicates = await knex('Document')
    .select('type', 'slug')
    .whereNotNull('type')
    .whereNotNull('slug')
    .groupBy('type', 'slug')
    .havingRaw('COUNT(*) > 1');

  // Process each group of duplicates
  for (const duplicate of duplicates) {
    const { type, slug } = duplicate;

    // Retrieve all documents with this type and slug
    const documents = await knex('Document')
      .where({ type, slug })
      .orderBy('created_at', 'asc')
      .select('id');

    // Keep the first document as is, modify the others
    for (let i = 1; i < documents.length; i++) {
      const newSlug = `${slug}-${i}`;
      await knex('Document')
        .where('id', documents[i].id)
        .update('slug', newSlug);
    }
  }

  // Create the unique index on type and slug
  await knex.schema.alterTable('Document', (table) => {
    table.unique(['type', 'slug'], {
      indexName: 'document_type_slug_unique',
    });
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Delete unique index
  await knex.schema.alterTable('Document', (table) => {
    table.dropUnique(['type', 'slug'], 'document_type_slug_unique');
  });
}
