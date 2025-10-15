/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Add the column
  await knex.schema.table('Document', function (table) {
    table.string('source_type').defaultTo('internal');
    table.unique('slug');
  });

  // Update all existing rows to have 'internal' as the value
  await knex('Document').update({ source_type: 'internal' });

  // Get all documents with type 'opencti_integration_feed'
  const documents = await knex('Document')
    .select('id')
    .where('type', 'opencti_integration_feed');

  // For each document, add metadata entry
  if (documents.length > 0) {
    const metadataEntries = documents.map((doc) => ({
      document_id: doc.id,
      key: 'integration_type',
      value: 'csv_feed',
    }));

    // Insert metadata entries
    await knex('Document_Metadata').insert(metadataEntries);
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Remove the metadata entries we added
  const documents = await knex('Document')
    .select('id')
    .where('type', 'opencti_integration_feed');

  if (documents.length > 0) {
    const documentIds = documents.map((doc) => doc.id);

    await knex('Document_Metadata')
      .whereIn('document_id', documentIds)
      .andWhere('key', 'integration_type')
      .andWhere('value', 'csv_feed')
      .delete();
  }

  // Remove source_type column
  return knex.schema.table('Document', function (table) {
    table.dropColumn('source_type');
    table.dropUnique('slug');
  });
}
