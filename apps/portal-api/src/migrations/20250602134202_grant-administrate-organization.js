/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const trx = await knex.transaction();

  try {
    await knex('UserOrganization_Capability')
      .where('name', '=', 'MANAGE_ACCESS')
      .update('name', 'ADMINISTRATE_ORGANIZATION')
      .transacting(trx);

    await replacePersonalSpaceUsersCapability(
      knex,
      trx,
      'MANAGE_SUBSCRIPTION',
      'ADMINISTRATE_ORGANIZATION'
    );

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
export async function down(knex) {
  const trx = await knex.transaction();
  try {
    await replacePersonalSpaceUsersCapability(
      knex,
      trx,
      'ADMINISTRATE_ORGANIZATION',
      'MANAGE_SUBSCRIPTION'
    );

    await knex('UserOrganization_Capability')
      .where('name', '=', 'ADMINISTRATE_ORGANIZATION')
      .update('name', 'MANAGE_ACCESS')
      .transacting(trx);

    await trx.commit();
  } catch (err) {
    await trx.rollback();
    throw err;
  }
}

/**
 * @param { import("knex").Knex } knex
 * @param oldCapabilityName string
 * @param newCapabilityName string
 * @returns { Promise<void> }
 */
async function replacePersonalSpaceUsersCapability(
  knex,
  trx,
  oldCapabilityName,
  newCapabilityName
) {
  const capabilitiesToUpdate = await knex('UserOrganization_Capability')
    .leftJoin(
      'User_Organization',
      'User_Organization.id',
      'UserOrganization_Capability.user_organization_id'
    )
    .leftJoin(
      'Organization',
      'Organization.id',
      'User_Organization.organization_id'
    )
    .where('Organization.personal_space', '=', true)
    .andWhere('UserOrganization_Capability.name', '=', oldCapabilityName)
    .select('UserOrganization_Capability.id as userOrganizationCapabilityId');

  const updates = capabilitiesToUpdate.map(
    async ({ userOrganizationCapabilityId }) => {
      await knex('UserOrganization_Capability')
        .where('id', userOrganizationCapabilityId)
        .update('name', newCapabilityName)
        .transacting(trx);
    }
  );

  await Promise.all(updates);
}
