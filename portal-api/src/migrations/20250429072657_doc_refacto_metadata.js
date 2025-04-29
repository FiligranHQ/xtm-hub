/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const documents = await knex('Document')
    .whereNotNull('product_version')
    .select('id', 'product_version');

  if (documents.length > 0) {
    const metadataEntries = documents.map((doc) => ({
      document_id: doc.id,
      key: 'product_version',
      value: doc.product_version,
    }));
    await knex('DocumentMetadata').insert(metadataEntries);
  }

  await knex.schema.alterTable('Document', (table) => {
    table.dropColumn('product_version');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('Document', (table) => {
    table.string('product_version');
  });

  const metadataEntries = await knex('DocumentMetadata')
    .where('key', 'product_version')
    .select('document_id', 'value');

  if (metadataEntries.length > 0) {
    const updates = metadataEntries.map(async (entry) => {
      await knex('Document')
        .where('id', entry.document_id)
        .update('product_version', entry.value);
    });

    await Promise.all(updates);
  }

  return knex('DocumentMetadata').where('key', 'product_version').delete();
}
