/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const trx = await knex.transaction();

  try {
    // Define the target role IDs that match our portal constants
    const targetRoles = [
      {
        name: 'ADMIN',
        targetId: '6b632cf2-9105-46ec-a463-ad59ab58c770',
      },
      {
        name: 'USER',
        targetId: '7a234567-8901-4def-9012-3456789abcde',
      },
      {
        name: 'ADMIN_ORGA',
        targetId: '40cfe630-c272-42f9-8fcf-f219e2f4278c',
      },
    ];

    for (const role of targetRoles) {
      // Check if role exists
      const existingRole = await knex('RolePortal')
        .where('name', role.name)
        .first()
        .transacting(trx);

      if (existingRole && existingRole.id === role.targetId) {
        // Role already has correct ID, skip
        continue;
      }

      if (existingRole) {
        // Check if target ID is already taken by another role
        const conflictingRole = await knex('RolePortal')
          .where('id', role.targetId)
          .andWhere('name', '!=', role.name)
          .first()
          .transacting(trx);

        if (conflictingRole) {
          // Generate a temporary ID for the conflicting role
          const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          await knex('RolePortal')
            .where('id', role.targetId)
            .update('id', tempId)
            .transacting(trx);
        }

        // Create the role with target ID first
        await knex('RolePortal')
          .insert({
            id: role.targetId,
            name: `${role.name}_temp`,
          })
          .transacting(trx);

        // Update foreign key references to point to new role
        await knex('User_RolePortal')
          .where('role_portal_id', existingRole.id)
          .update('role_portal_id', role.targetId)
          .transacting(trx);

        await knex('RolePortal_CapabilityPortal')
          .where('role_portal_id', existingRole.id)
          .update('role_portal_id', role.targetId)
          .transacting(trx);

        // Delete the old role and rename the temp one
        await knex('RolePortal')
          .where('id', existingRole.id)
          .del()
          .transacting(trx);

        await knex('RolePortal')
          .where('id', role.targetId)
          .update('name', role.name)
          .transacting(trx);
      } else {
        // Create the role if it doesn't exist
        await knex('RolePortal')
          .insert({
            id: role.targetId,
            name: role.name,
          })
          .transacting(trx);
      }
    }

    await trx.commit();
  } catch (err) {
    await trx.rollback();
    throw err;
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down() {
  // This migration standardizes role IDs, rollback is complex and potentially destructive
  // We'll leave the roles as-is since rolling back ID changes could break references
  console.warn(
    'Rollback not implemented for role ID standardization - roles kept as-is'
  );
}
