/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const MARKETING_UUID = 'ffc4b617-e968-43dc-91ed-8074759a49d0';
const REVENUE_LEADERSHIP_UUID = 'ba6fc032-f700-4ada-87a0-306a6d2f860f';
const MODIFY_TRIALS_UUID = '9faa68f2-a274-403b-b07f-3c8502239df5';
const READ_TRIALS_UUID = 'bb8cadfe-8853-486c-993e-ab0026348fec';
export async function up(knex) {
  await knex('RolePortal')
    .insert([
      {
        id: MARKETING_UUID,
        name: 'MARKETING',
      },
      {
        id: REVENUE_LEADERSHIP_UUID,
        name: 'REVENUE_LEADERSHIP',
      },
    ])
    .returning('id');

  await knex('CapabilityPortal')
    .insert({
      id: MODIFY_TRIALS_UUID,
      name: 'MODIFY_TRIALS',
    })
    .returning('id');

  await knex('RolePortal_CapabilityPortal').insert([
    {
      role_portal_id: MARKETING_UUID,
      capability_portal_id: READ_TRIALS_UUID,
    },
    {
      role_portal_id: REVENUE_LEADERSHIP_UUID,
      capability_portal_id: MODIFY_TRIALS_UUID,
    },
    {
      role_portal_id: REVENUE_LEADERSHIP_UUID,
      capability_portal_id: READ_TRIALS_UUID,
    },
  ]);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Delete the roles (cascade will handle RolePortal_CapabilityPortal)
  await knex('RolePortal')
    .whereIn('id', [MARKETING_UUID, REVENUE_LEADERSHIP_UUID])
    .delete();

  // Delete the capability (cascade will handle RolePortal_CapabilityPortal)
  await knex('CapabilityPortal').where({ id: MODIFY_TRIALS_UUID }).delete();
}
