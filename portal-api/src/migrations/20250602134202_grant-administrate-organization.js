/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await replaceUsersCapability(
    knex,
    'MANAGE_ACCESS',
    'ADMINISTRATE_ORGANIZATION'
  );
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await replaceUsersCapability(
    knex,
    'ADMINISTRATE_ORGANIZATION',
    'MANAGE_ACCESS'
  );
}

/**
 * @param { import("knex").Knex } knex
 * @param oldCapabilityName string
 * @param newCapabilityName string
 * @returns { Promise<void> }
 */
async function replaceUsersCapability(
  knex,
  oldCapabilityName,
  newCapabilityName
) {
  const trx = await knex.transaction();
  try {
    const usersToUpdate = await knex('User')
      .leftJoin('User_Organization', 'User_Organization.user_id', 'User.id')
      .leftJoin(
        'UserOrganization_Capability',
        'UserOrganization_Capability.user_organization_id',
        'User_Organization.id'
      )
      .leftJoin(
        'Organization',
        'Organization.id',
        'User_Organization.organization_id'
      )
      .where('Organization.personal_space', '=', false)
      .andWhere('UserOrganization_Capability.name', '=', oldCapabilityName)
      .select(
        'User_Organization.id as userOrganizationId',
        'UserOrganization_Capability.id as userOrganizationCapabilityId'
      );

    const updates = usersToUpdate.map(
      async ({ userOrganizationId, userOrganizationCapabilityId }) => {
        await knex('UserOrganization_Capability')
          .where('id', userOrganizationCapabilityId)
          .delete()
          .transacting(trx);

        await knex('UserOrganization_Capability')
          .insert({
            user_organization_id: userOrganizationId,
            name: newCapabilityName,
          })
          .transacting(trx);
      }
    );

    await Promise.all(updates);
    await trx.commit();
  } catch (err) {
    await trx.rollback();
    throw err;
  }
}
