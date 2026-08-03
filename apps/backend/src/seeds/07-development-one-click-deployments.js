export async function seed(knex) {
  const BYPASS_USER_ID = 'ba091095-418f-4b4f-b150-6c9295e232c3';
  const PLATFORM_ID = '0d1c0de0-0000-4000-8000-0000000000ff';

  const deploymentsPerResource = [
    ['187dfc29-631d-4795-aa59-4c8bdcc3fb5a', 5],
    ['bb734d93-4823-4637-a216-518d8ef55628', 3],
    ['1b226f91-4896-4298-af2d-1de0aae63e62', 2],
    ['7effeac6-8939-4316-8278-6adbe5c5dcb8', 4],
    ['1275352d-c49e-458d-b340-4e40d2035249', 1],
  ];

  const deploymentId = (n) =>
    `0d1c0de0-0000-4000-8000-${String(n).padStart(12, '0')}`;

  const rows = [];
  let index = 0;
  for (const [resourceId, count] of deploymentsPerResource) {
    for (let i = 0; i < count; i += 1) {
      index += 1;
      rows.push({
        id: deploymentId(index),
        resource_id: resourceId,
        platform_id: PLATFORM_ID,
        tenant_id: null,
        user_id: BYPASS_USER_ID,
        deployed_at: new Date(),
      });
    }
  }

  await knex('OneClickDeployment').insert(rows).onConflict('id').ignore();
}
