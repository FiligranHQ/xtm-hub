/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const PLATFORM_UUID = '97bba0a8-9bb8-4df8-aed4-59cac48f7b3c';
const MODIFY_TRIALS_QUOTA_UUID = '9d01799f-4cc2-4531-82c2-119ea4eea9d0';
const READ_TRIALS_UUID = 'bb8cadfe-8853-486c-993e-ab0026348fec';
export async function up(knex) {
  await knex('RolePortal')
    .insert([
      {
        id: PLATFORM_UUID,
        name: 'PLATFORM',
      },
    ])
    .returning('id');

  await knex('CapabilityPortal')
    .insert({
      id: MODIFY_TRIALS_QUOTA_UUID,
      name: 'MODIFY_TRIALS_QUOTA',
    })
    .returning('id');

  await knex('RolePortal_CapabilityPortal').insert([
    {
      role_portal_id: PLATFORM_UUID,
      capability_portal_id: MODIFY_TRIALS_QUOTA_UUID,
    },
    {
      role_portal_id: PLATFORM_UUID,
      capability_portal_id: READ_TRIALS_UUID,
    },
  ]);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('RolePortal').whereIn('id', [PLATFORM_UUID]).delete();

  await knex('CapabilityPortal')
    .where({ id: MODIFY_TRIALS_QUOTA_UUID })
    .delete();
}
