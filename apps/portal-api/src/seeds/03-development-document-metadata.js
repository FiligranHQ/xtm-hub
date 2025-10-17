export async function seed(knex) {
  // Document Metadata seed data from production
  await knex('Document_Metadata')
    .insert([
      {
        document_id: '187dfc29-631d-4795-aa59-4c8bdcc3fb5a',
        key: 'product_version',
        value: '6.5.2'
      },
      {
        document_id: '7effeac6-8939-4316-8278-6adbe5c5dcb8',
        key: 'product_version',
        value: '1.18.0'
      },
      {
        document_id: 'e02faca0-9d38-4981-94f2-72bf18ca9c53',
        key: 'integration_type',
        value: 'csv_feed'
      }
    ])
    .onConflict(['document_id', 'key'])
    .ignore();
}
