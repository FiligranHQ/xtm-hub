/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const MARKETING_UUID = 'ffc4b617-e968-43dc-91ed-8074759a49d0';
const MODIFY_SERVICE_METADATA_UUID = 'ca8ea760-279f-41b3-94c9-f8a72c16ce13';

export async function up(knex) {
  await knex('CapabilityPortal')
    .insert({
      id: MODIFY_SERVICE_METADATA_UUID,
      name: 'MODIFY_SERVICE_METADATA',
    })
    .returning('id');

  await knex('RolePortal_CapabilityPortal').insert([
    {
      role_portal_id: MARKETING_UUID,
      capability_portal_id: MODIFY_SERVICE_METADATA_UUID,
    },
  ]);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('CapabilityPortal')
    .where({ id: MODIFY_SERVICE_METADATA_UUID })
    .delete();
}
