export async function seed(knex) {
  await knex('User')
    .insert([
      {
        id: 'e389e507-f1cd-4f2f-bfb2-274140d87d28',
        email: 'user15@test.fr',
        salt: 'fabc28ed1339f8b34c10bc3b5a650c01',
        password:
          'a0bbec7075b7aca96feb276477a5ab4b8d86c495de9b5eb1e9f44dea11a1fea7b0621437a2e437517ecf222e1c730db96c51211856fd309a6293dba2aa44c24e',
        first_name: 'test',
        last_name: 'hello',
        selected_organization_id: 'ba091095-418f-4b4f-b150-6c9295e232c4',
      },
    ])
    .onConflict('id')
    .ignore();

  await knex('Organization')
    .insert([
      {
        id: 'e389e507-f1cd-4f2f-bfb2-274140d87d28',
        name: 'user15@test.fr',
        personal_space: true,
      },
    ])
    .onConflict('id')
    .ignore();

  await knex('User_Organization')
    .insert([
      {
        user_id: 'e389e507-f1cd-4f2f-bfb2-274140d87d28',
        organization_id: 'ba091095-418f-4b4f-b150-6c9295e232c4',
      },
      {
        user_id: 'e389e507-f1cd-4f2f-bfb2-274140d87d28',
        organization_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
      },
    ])
    .onConflict('id')
    .ignore();
}
