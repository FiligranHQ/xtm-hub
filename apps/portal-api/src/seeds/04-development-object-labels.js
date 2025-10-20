export async function seed(knex) {
  // Object_Label seed data from production
  // Links labels to documents
  await knex('Object_Label')
    .insert([
      {
        object_id: '7effeac6-8939-4316-8278-6adbe5c5dcb8',
        label_id: '44fa5750-102d-4b08-9af8-e71f6014ff58',
      },
      {
        object_id: '7effeac6-8939-4316-8278-6adbe5c5dcb8',
        label_id: '7e1f5dac-caae-417d-8dd7-36d7f5d33c19',
      },
      {
        object_id: 'e02faca0-9d38-4981-94f2-72bf18ca9c53',
        label_id: '1f6df625-88ee-412b-9400-056d99175769',
      },
      {
        object_id: 'e02faca0-9d38-4981-94f2-72bf18ca9c53',
        label_id: '5aac6fa2-d8ed-4c55-8275-7d9f6d078d35',
      },
      {
        object_id: 'e02faca0-9d38-4981-94f2-72bf18ca9c53',
        label_id: '6d920874-91b1-4288-95d1-019815400e22',
      },
    ])
    .onConflict(['object_id', 'label_id'])
    .ignore();
}
