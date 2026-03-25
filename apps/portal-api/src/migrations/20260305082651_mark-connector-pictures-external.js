const loadConnectorChildImageIds = async (knex) => {
  const parentConnectorIds = await knex('Document_Metadata')
    .where({ key: 'integration_type', value: 'connector' })
    .pluck('document_id');

  if (!parentConnectorIds.length) return [];

  const childImageIds = await knex('Document_Children')
    .leftJoin('Document', 'Document_Children.child_document_id', 'Document.id')
    .whereIn('Document_Children.parent_document_id', parentConnectorIds)
    .andWhere('Document.type', 'image')
    .pluck('Document.id');

  return childImageIds;
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  const childImageIds = await loadConnectorChildImageIds(knex);

  await knex('Document')
    .whereIn('id', childImageIds)
    .update({ source_type: 'external' });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  const childImageIds = await loadConnectorChildImageIds(knex);

  await knex('Document')
    .whereIn('id', childImageIds)
    .update({ source_type: 'internal' });
};
