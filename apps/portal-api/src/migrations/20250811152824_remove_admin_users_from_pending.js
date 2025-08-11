/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex
    .delete()
    .from('User_Organization_Pending as org_pending')
    .innerJoin(
      'User_RolePortal as user_role',
      'org_pending.user_id',
      'user_role.user_id'
    )
    .innerJoin('RolePortal as role', 'user_role.role_portal_id', 'role.id')
    .where('role.name', 'ADMIN')
    .whereExists(function () {
      this.select(1)
        .from('User_Organization as user_org')
        .whereRaw('user_org.user_id = org_pending.user_id')
        .whereRaw('user_org.organization_id = org_pending.organization_id');
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down() {}
