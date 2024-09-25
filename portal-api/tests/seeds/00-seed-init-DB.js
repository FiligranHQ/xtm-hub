export async function seed(knex) {
  const existingOrganization = await knex('Organization')
      .where('id', 'ba091095-418f-4b4f-b150-6c9295e232c4')
      .first();

  if (!existingOrganization) {
    await knex('Organization').insert([
      {
        id: 'ba091095-418f-4b4f-b150-6c9295e232c4',
        name: 'Internal',
        domains: ['filigran.io', 'internal.com'],
      },
    ]);
  }
  const existingUser = await knex('User')
      .where('id', 'ba091095-418f-4b4f-b150-6c9295e232c3')
      .first();
  if(!existingUser) {
    await knex('User').insert([
      {
        id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        email: 'admin@filigran.io',
        salt: 'fabc28ed1339f8b34c10bc3b5a650c01',
        password:
            'a0bbec7075b7aca96feb276477a5ab4b8d86c495de9b5eb1e9f44dea11a1fea7b0621437a2e437517ecf222e1c730db96c51211856fd309a6293dba2aa44c24e',
        first_name: null,
        last_name: null,
        organization_id: 'ba091095-418f-4b4f-b150-6c9295e232c4',
      },
    ]);
  }

  const existingRolePortals = await knex('RolePortal')
      .where('id', '6b632cf2-9105-46ec-a463-ad59ab58c770')
      .first();
  if(!existingRolePortals) {
    await knex('RolePortal').insert([
      {
        id: '6b632cf2-9105-46ec-a463-ad59ab58c770',
        name: 'ADMIN',
      },
      {
        id: '40cfe630-c272-42f9-8fcf-f219e2f4277b',
        name: 'USER',
      },
      {
        id: '40cfe630-c272-42f9-8fcf-f219e2f4278c',
        name: 'ADMIN_ORGA',
      },
    ]);
  }


  const existingUserRolePortals = await knex('User_RolePortal')
      .where('user_id', 'ba091095-418f-4b4f-b150-6c9295e232c3')
      .first();
  if(!existingUserRolePortals) {
    await knex('User_RolePortal').insert([
      {
        user_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
        role_portal_id: '6b632cf2-9105-46ec-a463-ad59ab58c770',
      },
    ]);
  }


  await knex('CapabilityPortal').insert([
    {
      id: '85c9fe6f-901f-4992-a8aa-b8d56a7e2e09',
      name: 'BYPASS',
    },
    {
      id: '6ff7515e-5d86-49e8-84b6-f301d12e6038',
      name: 'BCK_MANAGE_SERVICES',
    },
    {
      id: '6fd9bdea-6bf5-4621-8216-50bd7a6584c7',
      name: 'BCK_MANAGE_COMMUNITIES',
    },
    {
      id: '993b2b86-2310-47e9-90f2-b56ad9b15405',
      name: 'FRT_SERVICE_SUBSCRIBER',
    },
    {
      id: 'cabbc09c-275a-473b-b490-626b9ebf6939',
      name: 'FRT_MANAGE_SETTINGS',
    },
    {
      id: 'd583993e-2cb7-4fe9-ba47-2100ca7ae54f',
      name: 'FRT_ACCESS_BILLING',
    },
    {
      id: '350d67fe-5a9b-4b51-8d63-ad504d8a4999',
      name: 'FRT_MANAGE_USER',
    },
    {
      id: 'fe5ad46d-8851-4d8f-901b-4dfb5e738df5',
      name: 'FRT_ACCESS_SERVICES',
    },
  ]);

  await knex('RolePortal_CapabilityPortal').insert([
    {
      capability_portal_id: '85c9fe6f-901f-4992-a8aa-b8d56a7e2e09',
      role_portal_id: '6b632cf2-9105-46ec-a463-ad59ab58c770',
    },
    {
      capability_portal_id: '6ff7515e-5d86-49e8-84b6-f301d12e6038',
      role_portal_id: '40cfe630-c272-42f9-8fcf-f219e2f4278c',
    },
    {
      capability_portal_id: '6fd9bdea-6bf5-4621-8216-50bd7a6584c7',
      role_portal_id: '40cfe630-c272-42f9-8fcf-f219e2f4278c',
    },
    {
      capability_portal_id: '993b2b86-2310-47e9-90f2-b56ad9b15405',
      role_portal_id: '40cfe630-c272-42f9-8fcf-f219e2f4278c',
    },
    {
      capability_portal_id: 'cabbc09c-275a-473b-b490-626b9ebf6939',
      role_portal_id: '40cfe630-c272-42f9-8fcf-f219e2f4278c',
    },
    {
      capability_portal_id: 'd583993e-2cb7-4fe9-ba47-2100ca7ae54f',
      role_portal_id: '40cfe630-c272-42f9-8fcf-f219e2f4278c',
    },
    {
      capability_portal_id: '350d67fe-5a9b-4b51-8d63-ad504d8a4999',
      role_portal_id: '40cfe630-c272-42f9-8fcf-f219e2f4278c',
    },
    {
      capability_portal_id: 'fe5ad46d-8851-4d8f-901b-4dfb5e738df5',
      role_portal_id: '40cfe630-c272-42f9-8fcf-f219e2f4278c',
    },
    {
      capability_portal_id: 'fe5ad46d-8851-4d8f-901b-4dfb5e738df5',
      role_portal_id: '40cfe630-c272-42f9-8fcf-f219e2f4277b',
    },
  ]);
  await knex('Service').insert([
    {
      id: 'c6343882-f609-4a3f-abe0-a34f8cb11302',
      name: 'CyberWeather',
      description:
        'This is a short description to describe the CyberWeather app, how to use it, etc.',
      provider: 'SCRED',
      type: 'Intel',
      creation_status: 'READY',
      subscription_service_type: 'SUBSCRIPTABLE_DIRECT',
    },
    {
      id: 'd6343883-f609-5a3f-ace1-a24f8cb11454',
      name: 'OpenFeed',
      description:
        'This is a short description to describe the OpenFeed app, how to use it, etc.',
      provider: 'SCRED',
      type: 'Feed',
      creation_status: 'READY',
      subscription_service_type: 'SUBSCRIPTABLE_DIRECT',
    },
    {
      id: '234a5d21-8a1f-4d3f-8f57-7fd21c321bd4',
      name: 'Malware analysis',
      description:
        'This is a short description to describe the Malware analysis app, how to use it, etc.',
      provider: 'Glimps',
      type: 'analysis',
      creation_status: 'READY',
      subscription_service_type: 'SUBSCRIPTABLE_BACKOFFICE',
    },
  ]);
  await knex('Service_Link').insert([
    {
      id: 'f4f539f8-1d16-479d-9e72-185c9e02c6af',
      service_id: 'c6343882-f609-4a3f-abe0-a34f8cb11302',
      url: 'https://weather.dev.scredplatform.io/',
      name: 'CyberWeatherApp',
    },
    {
      id: 'b0e5df84-512a-4ced-8968-7bb4916edd33',
      service_id: 'd6343883-f609-5a3f-ace1-a24f8cb11454',
      url: 'https://opencti-test2.non-prod.scredplatform.io/',
      name: 'OpenFeed',
    },
    {
      id: 'b3c1664d-2337-46f5-a3ce-c3b72460e71a',
      service_id: '234a5d21-8a1f-4d3f-8f57-7fd21c321bd4',
      url: '/service/malware-analysis',
      name: 'MalwareAnalysis',
    },
  ]);
  await knex('Service_Price').insert([
    {
      id: '7c6c5d07-07d4-4418-b441-bc19f2d14825',
      service_id: 'c6343882-f609-4a3f-abe0-a34f8cb11302',
      fee_type: 'YEARLY',
      start_date: null,
      price: 0,
    },
    {
      id: '18becc6c-6912-498b-868d-062d4f0d05c5',
      service_id: 'd6343883-f609-5a3f-ace1-a24f8cb11454',
      fee_type: 'YEARLY',
      start_date: null,
      price: 0,
    },
    {
      id: '59a3db90-f963-4560-a0c1-ee29f6a221c1',
      service_id: '234a5d21-8a1f-4d3f-8f57-7fd21c321bd4',
      fee_type: 'YEARLY',
      start_date: null,
      price: 20000,
    },
  ]);
}
