export async function seed(knex) {
  // Object_UseCase seed data from production
  // Links use casess to documents
  await knex('Object_UseCase')
    .insert([
      {
        object_id: '7effeac6-8939-4316-8278-6adbe5c5dcb8',
        use_case_id: '44fa5750-102d-4b08-9af8-e71f6014ff58',
      },
      {
        object_id: '7effeac6-8939-4316-8278-6adbe5c5dcb8',
        use_case_id: '7e1f5dac-caae-417d-8dd7-36d7f5d33c19',
      },
      {
        object_id: 'e02faca0-9d38-4981-94f2-72bf18ca9c53',
        use_case_id: '1f6df625-88ee-412b-9400-056d99175769',
      },
      {
        object_id: 'e02faca0-9d38-4981-94f2-72bf18ca9c53',
        use_case_id: '5aac6fa2-d8ed-4c55-8275-7d9f6d078d35',
      },
      {
        object_id: 'e02faca0-9d38-4981-94f2-72bf18ca9c53',
        use_case_id: '6d920874-91b1-4288-95d1-019815400e22',
      },
      {
        object_id: '1b226f91-4896-4298-af2d-1de0aae63e62',
        use_case_id: '64aed898-bf64-4872-b83c-b7b720d2edb7',
      },
      {
        object_id: '1b226f91-4896-4298-af2d-1de0aae63e62',
        use_case_id: 'c3335831-66ee-4302-af74-09f618b76d67',
      },
      {
        object_id: 'e53832ce-2f5a-4fe5-ba5b-6fef1d6ad1d4',
        use_case_id: '1f6df625-88ee-412b-9400-056d99175769',
      },
      {
        object_id: 'e53832ce-2f5a-4fe5-ba5b-6fef1d6ad1d4',
        use_case_id: '7e1f5dac-caae-417d-8dd7-36d7f5d33c19',
      },
      {
        object_id: '00ab5423-1b12-468f-9d67-2af079807205',
        use_case_id: '6d920874-91b1-4288-95d1-019815400e22',
      },
      {
        object_id: '00ab5423-1b12-468f-9d67-2af079807205',
        use_case_id: '7e1f5dac-caae-417d-8dd7-36d7f5d33c19',
      },
      {
        object_id: '00ab5423-1b12-468f-9d67-2af079807205',
        use_case_id: '44fa5750-102d-4b08-9af8-e71f6014ff58',
      },
    ])
    .onConflict(['object_id', 'use_case_id'])
    .ignore();
}
