/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Rename the column in the User table
  await knex.schema.table('User', function (table) {
    table.renameColumn('organization_id', 'selected_organization_id');
  });

  // Create the new User_Organization table
  await knex.schema.createTable('User_Organization', function (table) {
    table.increments('id').primary();
    table.uuid('user_id').references('id').inTable('User').onDelete('CASCADE');
    table
      .uuid('organization_id')
      .references('id')
      .inTable('Organization')
      .onDelete('CASCADE');
  });

  // Migrate existing organization_id data to the new User_Organization table
  const users = await knex('User').select();

  // In case there are no users (first time running the app);
  if (!users) {
    return;
  }

  const userOrganizationData = users
    .filter((user) => user.selected_organization_id) // Ensure there's a selected org
    .map((user) => ({
      user_id: user.id,
      organization_id: user.selected_organization_id,
    }));

  if (userOrganizationData.length > 0) {
    await knex('User_Organization').insert(userOrganizationData);
  }

  // Create personal space for each user in the Organization table
  const userPersonalSpace = users.map((user) => ({
    id: user.id,
    name: user.email,
  }));

  if (userPersonalSpace.length > 0) {
    await knex('Organization').insert(userPersonalSpace);
  }

  // Add personal space to the User_Organization table
  const userPersonalSpaceOrg = users.map((user) => ({
    user_id: user.id,
    organization_id: user.id, // personal space organization ID is the user’s ID
  }));

  if (userPersonalSpaceOrg.length > 0) {
    await knex('User_Organization').insert(userPersonalSpaceOrg);
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  //  Drop the User_Organization table
  await knex.schema.dropTable('User_Organization');

  // Rename selected_organization_id back to organization_id in the User table
  await knex.schema.table('User', function (table) {
    table.renameColumn('selected_organization_id', 'organization_id');
  });

  // Delete personal space organizations based on users' emails
  const users = await knex('User').select('email');
  const userEmails = users.map((user) => user.email);

  await knex('Organization').whereIn('name', userEmails).del();
}
