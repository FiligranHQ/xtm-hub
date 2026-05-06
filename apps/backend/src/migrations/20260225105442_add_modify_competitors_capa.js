/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const MARKETING_UUID = 'ffc4b617-e968-43dc-91ed-8074759a49d0';
const MODIFY_COMPETITORS_UUID = '0352407a-3e50-4d81-8a00-645c9b19e5e9';
export async function up(knex) {
  await knex('CapabilityPortal')
    .insert({
      id: MODIFY_COMPETITORS_UUID,
      name: 'MODIFY_COMPETITORS',
    })
    .returning('id');

  await knex('RolePortal_CapabilityPortal').insert([
    {
      role_portal_id: MARKETING_UUID,
      capability_portal_id: MODIFY_COMPETITORS_UUID,
    },
  ]);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('CapabilityPortal')
    .where({ id: MODIFY_COMPETITORS_UUID })
    .delete();
}
