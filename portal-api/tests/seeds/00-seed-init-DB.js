export async function seed(knex) {
  await knex('Organization')
    .insert([
      {
        id: 'ba091095-418f-4b4f-b150-6c9295e232c4',
        name: 'Filigran',
        domains: ['filigran.io', 'internal.com'],
      },
    ])
    .onConflict('id')
    .ignore();

  await knex('User')
    .insert([
      {
        id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        email: 'admin@filigran.io',
        salt: 'fabc28ed1339f8b34c10bc3b5a650c01',
        password:
          'a0bbec7075b7aca96feb276477a5ab4b8d86c495de9b5eb1e9f44dea11a1fea7b0621437a2e437517ecf222e1c730db96c51211856fd309a6293dba2aa44c24e',
        first_name: 'firstname',
        last_name: 'lastname',
        selected_organization_id: 'ba091095-418f-4b4f-b150-6c9295e232c4',
      },
    ])
    .onConflict('id')
    .ignore();

  await knex('Organization')
    .insert([
      {
        id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        name: 'admin@filigran.io',
        personal_space: true,
      },
    ])
    .onConflict('id')
    .ignore();

  const userOrganizations = await knex('User_Organization')
    .insert([
      {
        user_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        organization_id: 'ba091095-418f-4b4f-b150-6c9295e232c4',
      },
      {
        user_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        organization_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
      },
    ])
    .returning('id');

  for (const userOrg of userOrganizations) {
    await knex('UserOrganization_Capability').insert([
      {
        user_organization_id: userOrg.id,
        name: 'MANAGE_ACCESS',
      },
      {
        user_organization_id: userOrg.id,
        name: 'MANAGE_SUBSCRIPTION',
      },
    ]);
  }

  await knex('RolePortal')
    .insert([{ id: '6b632cf2-9105-46ec-a463-ad59ab58c770', name: 'ADMIN' }])
    .onConflict('id')
    .ignore();

  await knex('User_RolePortal').insert([
    {
      user_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
      role_portal_id: '6b632cf2-9105-46ec-a463-ad59ab58c770',
    },
  ]);

  await knex('CapabilityPortal')
    .insert([{ id: '85c9fe6f-901f-4992-a8aa-b8d56a7e2e09', name: 'BYPASS' }])
    .onConflict('id')
    .ignore();

  await knex('RolePortal_CapabilityPortal').insert([
    {
      capability_portal_id: '85c9fe6f-901f-4992-a8aa-b8d56a7e2e09',
      role_portal_id: '6b632cf2-9105-46ec-a463-ad59ab58c770',
    },
  ]);

  await knex('ServiceDefinition')
    .insert([
      {
        id: '2634d52b-f061-4ebc-bed2-c6cc94297ad1',
        name: 'ServiceDef',
        description: 'myDescription',
        public: true,
        identifier: 'vault',
      },
    ])
    .onConflict('id')
    .ignore();

  await knex('ServiceInstance')
    .insert([
      {
        id: 'c6343882-f609-4a3f-abe0-a34f8cb11302',
        name: 'CyberWeather',
        description:
          'This is a short description to describe the CyberWeather app, how to use it, etc.',
        creation_status: 'READY',
        public: true,
        join_type: 'JOIN_AUTO',
        tags: '{others}',
        service_definition_id: '2634d52b-f061-4ebc-bed2-c6cc94297ad1',
      },
      {
        id: 'd6343883-f609-5a3f-ace1-a24f8cb11454',
        name: 'OpenFeed',
        description:
          'This is a short description to describe the OpenFeed app, how to use it, etc.',
        creation_status: 'READY',
        public: true,
        join_type: 'JOIN_AUTO',
        tags: '{others}',
        service_definition_id: '2634d52b-f061-4ebc-bed2-c6cc94297ad1',
      },
      {
        id: '234a5d21-8a1f-4d3f-8f57-7fd21c321bd4',
        name: 'Malware analysis',
        description:
          'This is a short description to describe the Malware analysis app, how to use it, etc.',
        creation_status: 'READY',
        public: true,
        join_type: 'JOIN_AUTO',
        tags: '{others}',
        service_definition_id: '2634d52b-f061-4ebc-bed2-c6cc94297ad1',
      },
    ])
    .onConflict('id')
    .ignore();

  await knex('Service_Link')
    .insert([
      {
        id: 'f4f539f8-1d16-479d-9e72-185c9e02c6af',
        service_instance_id: 'c6343882-f609-4a3f-abe0-a34f8cb11302',
        url: 'https://weather.dev.scredplatform.io/',
        name: 'CyberWeatherApp',
      },
      {
        id: 'b0e5df84-512a-4ced-8968-7bb4916edd33',
        service_instance_id: 'd6343883-f609-5a3f-ace1-a24f8cb11454',
        url: 'https://opencti-test2.non-prod.scredplatform.io/',
        name: 'OpenFeed',
      },
      {
        id: 'b3c1664d-2337-46f5-a3ce-c3b72460e71a',
        service_instance_id: '234a5d21-8a1f-4d3f-8f57-7fd21c321bd4',
        url: '/service/malware-analysis',
        name: 'MalwareAnalysis',
      },
    ])
    .onConflict('id')
    .ignore();

  await knex('Service_Price')
    .insert([
      {
        id: '7c6c5d07-07d4-4418-b441-bc19f2d14825',
        service_definition_id: '2634d52b-f061-4ebc-bed2-c6cc94297ad1',
        fee_type: 'YEARLY',
        start_date: null,
        price: 0,
      },
    ])
    .onConflict('id')
    .ignore();
}
