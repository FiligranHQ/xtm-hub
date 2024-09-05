export async function seed(knex) {
  await knex('Subscription').insert([
    {
      id: '656ab1ab-ccf5-4253-9ba8-15ea0d2f9594',
      service_id: '575d37c8-53ed-4c63-ae86-2d8d10f14eaf',
      organization_id: '681fb117-e2c3-46d3-945a-0e921b5d4b6c',
      billing: 0,
    },
  ]);
  await knex('User_Service').insert([
    {
      id: '8570e607-2fdf-4e60-92e0-4c0949cfcc5d',
      user_id: '015c0488-848d-4c89-95e3-8a243971f594',
      subscription_id: '656ab1ab-ccf5-4253-9ba8-15ea0d2f9594',
    },
    {
      id: '6ef5b834-d4f0-4e7b-ab98-fce10662c88f',
      user_id: '154006e2-f24b-42da-b39c-e0fb17bead00',
      subscription_id: '656ab1ab-ccf5-4253-9ba8-15ea0d2f9594',
    },
  ]);
  await knex('Service_Capability').insert([
    {
      id: 'a0aa3209-1956-486c-ad43-4542da538f79',
      user_service_id: '8570e607-2fdf-4e60-92e0-4c0949cfcc5d',
      service_capability_name: 'ACCESS_SERVICE',
    },
    {
      id: 'd37a22f2-1155-4c83-9eca-980dec865260',
      user_service_id: '6ef5b834-d4f0-4e7b-ab98-fce10662c88f',
      service_capability_name: 'ACCESS_SERVICE',
    },
  ]);
}
