export async function seed(knex) {
  await knex('User')
    .insert([
      {
        id: 'e389e507-f1cd-4f2f-bfb2-274140d87d28',
        email: 'user15@test.fr',
        salt: '222915edfa545035f37ca58efc453e38',
        password:
          '6fdbb0fc38930cf8fa9d3b88ff23ec20bd4f048189263d6d77e962cd2528aae3cd03b265b3114912ec74fc6783341f802f5f04a749393ccda786798bcdb010f8',
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
