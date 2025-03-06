export async function seed(knex) {
  await knex('Organization')
    .insert([
      {
        id: '681fb117-e2c3-46d3-945a-0e921b5d4b6c',
        name: 'Thales',
        domains: ['thales.com'],
      },
    ])
    .onConflict('name')
    .ignore();
  await knex('User')
    .insert([
      {
        id: '015c0488-848d-4c89-95e3-8a243971f594',
        email: 'admin@thales.com',
        salt: 'fabc28ed1339f8b34c10bc3b5a650c01',
        password:
          'a0bbec7075b7aca96feb276477a5ab4b8d86c495de9b5eb1e9f44dea11a1fea7b0621437a2e437517ecf222e1c730db96c51211856fd309a6293dba2aa44c24e',
        first_name: null,
        last_name: null,
        selected_organization_id: '681fb117-e2c3-46d3-945a-0e921b5d4b6c',
      },
      {
        id: '154006e2-f24b-42da-b39c-e0fb17bead00',
        email: 'user@thales.com',
        salt: 'fabc28ed1339f8b34c10bc3b5a650c01',
        password:
          'a0bbec7075b7aca96feb276477a5ab4b8d86c495de9b5eb1e9f44dea11a1fea7b0621437a2e437517ecf222e1c730db96c51211856fd309a6293dba2aa44c24e',
        first_name: null,
        last_name: null,
        selected_organization_id: '681fb117-e2c3-46d3-945a-0e921b5d4b6c',
      },
    ])
    .onConflict('id')
    .ignore();

  await knex('Organization')
    .insert([
      {
        id: '015c0488-848d-4c89-95e3-8a243971f594',
        name: 'admin@thales.com',
        personal_space: true,
      },
      {
        id: '154006e2-f24b-42da-b39c-e0fb17bead00',
        name: 'user@thales.com',
        personal_space: true,
      },
    ])
    .onConflict('id')
    .ignore();

  await knex('User_Organization')
    .insert([
      {
        user_id: '015c0488-848d-4c89-95e3-8a243971f594',
        organization_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
      },
      {
        user_id: '154006e2-f24b-42da-b39c-e0fb17bead00',
        organization_id: '681fb117-e2c3-46d3-945a-0e921b5d4b6c',
      },
      {
        user_id: '154006e2-f24b-42da-b39c-e0fb17bead00',
        organization_id: '154006e2-f24b-42da-b39c-e0fb17bead00',
      },
    ])
    .onConflict('id')
    .ignore();

  const userOrganizations = await knex('User_Organization')
    .insert([
      {
        user_id: '015c0488-848d-4c89-95e3-8a243971f594',
        organization_id: '681fb117-e2c3-46d3-945a-0e921b5d4b6c',
      },
    ])
    .returning('id')
    .onConflict('id')
    .ignore();

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
}
