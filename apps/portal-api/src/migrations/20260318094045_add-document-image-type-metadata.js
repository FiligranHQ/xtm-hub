/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  const imageDocuments = await knex('Document')
    .select('*')
    .where('type', 'image');

  const newMetadata = [];

  for (const image of imageDocuments) {
    const parent = await knex('Document')
      .leftJoin(
        'Document_Children',
        'Document_Children.parent_document_id',
        '=',
        'Document.id'
      )
      .where('child_document_id', '=', image.id)
      .first();

    const integrationType = await knex('Document_Metadata')
      .where('key', '=', 'integration_type')
      .andWhere('document_id', '=', parent.id)
      .first();

    const imageType = integrationType?.value === 'connector' ? 'logo' : 'image';
    newMetadata.push({
      document_id: image.id,
      key: 'image_type',
      value: imageType,
    });
  }

  if (newMetadata.length) {
    await knex('Document_Metadata').insert(newMetadata);
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex('Document_Metadata').where('key', '=', 'image_type').del();
};
