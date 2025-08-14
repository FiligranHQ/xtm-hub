/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const userOrganizationData = await knex('User')
    .select('User.id as user_id', 'org.id as organization_id')
    .from('User')
    .join(
      knex.raw(
        '"Organization" as org ON LOWER(split_part("User".email, \'@\', 2)) = ANY(SELECT LOWER(unnest(org.domains)))'
      )
    )
    .whereNotExists(function () {
      this.select(1)
        .from('User_Organization as user_org')
        .whereRaw('user_org.user_id = "User".id')
        .whereRaw('user_org.organization_id = org.id');
    })
    .whereNotExists(function () {
      this.select(1)
        .from('User_Organization_Pending as user_org_pending')
        .whereRaw('user_org_pending.user_id = "User".id')
        .whereRaw('user_org_pending.organization_id = org.id');
    });

  if (userOrganizationData.length > 0) {
    await knex('User_Organization_Pending').insert(userOrganizationData);
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.delete().from('User_Organization_Pending');
}
