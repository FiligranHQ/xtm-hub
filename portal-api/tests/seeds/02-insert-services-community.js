export async function seed(knex) {
  await knex('Service').insert([
    {
      id: '575d37c8-53ed-4c63-ae86-2d8d10f14eaf',
      name: 'Test',
      description: 'short',
      provider: 'SCRED_ONDEMAND',
      type: 'COMMUNITY',
      creation_status: 'READY',
      subscription_service_type: 'SUBSCRIPTABLE_BACKOFFICE',
    },
  ]);
  await knex('Service_Link').insert([
    {
      id: '86a0b81b-de3c-4790-bb1d-96d95135271b',
      service_id: '575d37c8-53ed-4c63-ae86-2d8d10f14eaf',
      url: 'http://www.google.fr',
      name: 'OpenFeed',
    },
    {
      id: '814fb413-5f11-4dea-9aef-492db0e2a680',
      service_id: '575d37c8-53ed-4c63-ae86-2d8d10f14eaf',
      url: 'http://www.google.fr',
      name: 'PrivateFeed',
    },
    {
      id: '9cd71b26-84eb-4711-8b1d-58f94d8b9aa1',
      service_id: '575d37c8-53ed-4c63-ae86-2d8d10f14eaf',
      url: 'http://www.google.fr',
      name: 'CyberWeather',
    },
    {
      id: '2baba29b-62f5-4d50-8d68-eb8a25887d9c',
      service_id: '575d37c8-53ed-4c63-ae86-2d8d10f14eaf',
      url: 'http://www.google.fr',
      name: 'NextCloud',
    },
  ]);
  await knex('Service_Price').insert([
    {
      id: '65ca846b-b4ff-42ec-bafa-cc604eea11f5',
      service_id: '575d37c8-53ed-4c63-ae86-2d8d10f14eaf',
      fee_type: 'MONTHLY',
      start_date: '2024-08-08',
      price: 1000,
    },
  ]);
}
