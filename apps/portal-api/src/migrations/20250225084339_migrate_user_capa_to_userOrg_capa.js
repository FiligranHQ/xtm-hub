/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const userOrganizations = await knex('User_Organization').select('*');
  for (const userOrg of userOrganizations) {
    const { id: userOrgId, user_id, organization_id } = userOrg;
    // In case of personal space
    if (user_id === organization_id) {
      await knex('UserOrganization_Capability').insert([
        { user_organization_id: userOrgId, name: 'MANAGE_SUBSCRIPTION' },
      ]);
      continue; // Skip further processing for personal spaces
    }

    const userRoles = await knex('User_RolePortal')
      .join('RolePortal', 'User_RolePortal.role_portal_id', 'RolePortal.id')
      .where('User_RolePortal.user_id', user_id)
      .select('RolePortal.name');

    const roleNames = userRoles.map((role) => role.name);

    if (roleNames.includes('ADMIN_ORGA')) {
      await knex('UserOrganization_Capability').insert([
        { user_organization_id: userOrgId, name: 'MANAGE_ACCESS' },
        { user_organization_id: userOrgId, name: 'MANAGE_SUBSCRIPTION' },
      ]);
    }
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('UserOrganization_Capability').del();
}
