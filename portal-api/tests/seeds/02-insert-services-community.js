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
  ]).onConflict('id')
      .ignore();
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
  ]).onConflict('id')
      .ignore();
  await knex('Service_Price').insert([
    {
      id: '65ca846b-b4ff-42ec-bafa-cc604eea11f5',
      service_id: '575d37c8-53ed-4c63-ae86-2d8d10f14eaf',
      fee_type: 'MONTHLY',
      start_date: '2024-08-08',
      price: 1000,
    },
  ]).onConflict('id')
      .ignore();
  await knex('Subscription').insert([
    {
      id: 'fdd973f0-6e8e-4794-9857-da84830679d5',
      organization_id: 'ba091095-418f-4b4f-b150-6c9295e232c4',
      service_id: '575d37c8-53ed-4c63-ae86-2d8d10f14eaf',
      start_date: '2024-08-08',
      end_date: null,
      status: 'ACCEPTED',
    },
  ]).onConflict('id')
      .ignore();
  await knex('User_Service').insert([
    {
      id: '4055e8a2-5ee2-4438-b422-62ff2e6c027f',
      user_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
      subscription_id: 'fdd973f0-6e8e-4794-9857-da84830679d5',
      service_personal_data: null,
    },
  ]).onConflict('id')
      .ignore();

  await knex('Service_Capability').insert([
    {
      id: '706c2468-581e-4739-8d25-082c0a3f328d',
      user_service_id: '4055e8a2-5ee2-4438-b422-62ff2e6c027f',
      service_capability_name: 'ADMIN_SUBSCRIPTION',
    },
    {
      id: '51491107-5dc5-4aee-bca6-e07410844477',
      user_service_id: '4055e8a2-5ee2-4438-b422-62ff2e6c027f',
      service_capability_name: 'MANAGE_ACCESS',
    },
    {
      id: 'ccb3c0e7-29dd-4cd0-bb9d-b428bd1f5cab',
      user_service_id: '4055e8a2-5ee2-4438-b422-62ff2e6c027f',
      service_capability_name: 'ACCESS_SERVICE',
    },
  ]).onConflict('id')
      .ignore();
}
