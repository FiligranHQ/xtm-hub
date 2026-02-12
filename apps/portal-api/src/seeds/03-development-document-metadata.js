export async function seed(knex) {
  // Document Metadata seed data from production
  await knex('Document_Metadata')
    .insert([
      {
        document_id: '187dfc29-631d-4795-aa59-4c8bdcc3fb5a',
        key: 'product_version',
        value: '6.5.2',
      },
      {
        document_id: 'bb734d93-4823-4637-a216-518d8ef55628',
        key: 'product_version',
        value: '6.8.4',
      },
      {
        document_id: '7effeac6-8939-4316-8278-6adbe5c5dcb8',
        key: 'product_version',
        value: '1.18.0',
      },
      {
        document_id: '1275352d-c49e-458d-b340-4e40d2035249',
        key: 'product_version',
        value: '1.4.0',
      },
      {
        document_id: 'e02faca0-9d38-4981-94f2-72bf18ca9c53',
        key: 'integration_type',
        value: 'csv_feed',
      },
      {
        document_id: 'e02faca0-9d38-4981-94f2-72bf18ca9c53',
        key: 'feed_url',
        value: 'https://example.com',
      },
      {
        document_id: '1b226f91-4896-4298-af2d-1de0aae63e62',
        key: 'integration_type',
        value: 'taxii_feed',
      },
      {
        document_id: '1b226f91-4896-4298-af2d-1de0aae63e62',
        key: 'integration_subtype',
        value: 'NATIVE',
      },
      {
        document_id: '1b226f91-4896-4298-af2d-1de0aae63e62',
        key: 'feed_url',
        value: 'https://test.fr',
      },
      {
        document_id: 'e53832ce-2f5a-4fe5-ba5b-6fef1d6ad1d4',
        key: 'integration_type',
        value: 'stream',
      },
      {
        document_id: 'e53832ce-2f5a-4fe5-ba5b-6fef1d6ad1d4',
        key: 'integration_subtype',
        value: 'NATIVE',
      },
      {
        document_id: 'e53832ce-2f5a-4fe5-ba5b-6fef1d6ad1d4',
        key: 'feed_url',
        value: 'https://github.com',
      },
      {
        document_id: '00ab5423-1b12-468f-9d67-2af079807205',
        key: 'integration_type',
        value: 'third_party_integration',
      },
      {
        document_id: '00ab5423-1b12-468f-9d67-2af079807205',
        key: 'integration_subtype',
        value: 'ORCHESTRATION',
      },
      {
        document_id: '00ab5423-1b12-468f-9d67-2af079807205',
        key: 'vendor_url',
        value: 'http://vendor.url',
      },
      {
        document_id: '00ab5423-1b12-468f-9d67-2af079807205',
        key: 'github_url',
        value: 'http://github.com',
      },
      {
        document_id: '00ab5423-1b12-468f-9d67-2af079807205',
        key: 'product_version',
        value: '1.2.3',
      },
    ])
    .onConflict(['document_id', 'key'])
    .ignore();
}
