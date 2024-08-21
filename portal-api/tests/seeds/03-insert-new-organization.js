export async function seed(knex) {
  await knex('Organization').insert([
    {
      id: '681fb117-e2c3-46d3-945a-0e921b5d4b6c',
      name: 'Thales',
    },
  ]);
  await knex('User').insert([
    {
      id: '015c0488-848d-4c89-95e3-8a243971f594',
      email: 'admin@thales.com',
      salt: 'fabc28ed1339f8b34c10bc3b5a650c02',
      password:
        'b0bbec7075b7aca96feb276477a5ab4b8d86c495de9b5eb1e9f44dea11a1fea7b0621437a2e437517ecf222e1c730db96c51211856fd309a6293dba2aa44c24e',
      first_name: null,
      last_name: null,
      organization_id: '681fb117-e2c3-46d3-945a-0e921b5d4b6c',
    },
    {
      id: '154006e2-f24b-42da-b39c-e0fb17bead00',
      email: 'user@thales.com',
      salt: 'fabc28ed1339f8b34c10bc3b5a650c03',
      password:
        'c0bbec7075b7aca96feb276477a5ab4b8d86c495de9b5eb1e9f44dea11a1fea7b0621437a2e437517ecf222e1c730db96c51211856fd309a6293dba2aa44c24e',
      first_name: null,
      last_name: null,
      organization_id: '681fb117-e2c3-46d3-945a-0e921b5d4b6c',
    },
  ]);
  await knex('User_RolePortal').insert([
    {
      user_id: '015c0488-848d-4c89-95e3-8a243971f594',
      role_portal_id: '6b632cf2-9105-46ec-a463-ad59ab58c770',
    },
    {
      user_id: '154006e2-f24b-42da-b39c-e0fb17bead00',
      role_portal_id: '40cfe630-c272-42f9-8fcf-f219e2f4277b',
    },
  ]);
}
