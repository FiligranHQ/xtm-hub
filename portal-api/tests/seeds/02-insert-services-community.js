export async function seed(knex) {
  await knex('ServiceInstance')
    .insert([
      {
        id: 'e88e8f80-ba9e-480b-ab27-8613a1565eff',
        name: 'Vault',
        description: 'short description for Vault',
        creation_status: 'READY',
        public: false,
        join_type: 'JOIN_INVITE',
        tags: '{others}',
        service_definition_id: '2634d52b-f061-4ebc-bed2-c6cc94297ad1',
      },
    ])
    .onConflict('id')
    .ignore();
  await knex('Service_Link')
    .insert([
      {
        id: '2baba29b-62f5-4d50-8d68-eb8a25887d9c',
        service_instance_id: 'e88e8f80-ba9e-480b-ab27-8613a1565eff',
        url: '/service/vault',
        name: 'Vault',
      },
    ])
    .onConflict('id')
    .ignore();
  await knex('Service_Price')
    .insert([
      {
        id: '65ca846b-b4ff-42ec-bafa-cc604eea11f5',
        service_definition_id: '2634d52b-f061-4ebc-bed2-c6cc94297ad1',
        fee_type: 'MONTHLY',
        start_date: '2024-08-08',
        price: 1000,
      },
    ])
    .onConflict('id')
    .ignore();
  await knex('Subscription')
    .insert([
      {
        id: '7f17820c-3a36-4023-ae3c-e2c15613b518',
        organization_id: 'ba091095-418f-4b4f-b150-6c9295e232c4',
        service_instance_id: 'e88e8f80-ba9e-480b-ab27-8613a1565eff',
        start_date: '2024-08-08',
        end_date: null,
        status: 'ACCEPTED',
      },
    ])
    .onConflict('id')
    .ignore();
  await knex('User_Service')
    .insert([
      {
        id: '4055e8a2-5ee2-4438-b422-62ff2e6c027f',
        user_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        subscription_id: '7f17820c-3a36-4023-ae3c-e2c15613b518',
        service_personal_data: null,
      },
    ])
    .onConflict('id')
    .ignore();

  await knex('Generic_Service_Capability')
    .insert([
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
    ])
    .onConflict('id')
    .ignore();
}
