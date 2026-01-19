/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const REVENUE_SALES_UUID = '907f53cc-492f-4537-8702-e24b8ae515ca';
const READ_TRIALS_UUID = 'bb8cadfe-8853-486c-993e-ab0026348fec';
export async function up(knex) {
  const [role] = await knex('RolePortal')
    .insert({
      id: REVENUE_SALES_UUID,
      name: 'REVENUE_SALES',
    })
    .returning('id');

  const [newCapability] = await knex('CapabilityPortal')
    .insert({
      id: READ_TRIALS_UUID,
      name: 'READ_TRIALS',
    })
    .returning('id');

  await knex('RolePortal_CapabilityPortal').insert({
    role_portal_id: role.id,
    capability_portal_id: newCapability.id,
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('RolePortal').where({ id: REVENUE_SALES_UUID }).delete();

  await knex('CapabilityPortal').where({ id: READ_TRIALS_UUID }).delete();
}
