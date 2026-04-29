/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
const MANAGE_DEPLOYMENT_UUID = 'dd8c7ad4-0032-4253-9f90-236200d55366';
const MANAGE_CONNECTORS_INGESTIONS_UUID =
  'c2b8fa37-0d67-4d22-a99b-3bc6b645f2ab';

export async function up(knex) {
  await knex('CapabilityPortal')
    .insert([
      {
        id: MANAGE_DEPLOYMENT_UUID,
        name: 'MANAGE_DEPLOYMENT',
      },
      {
        id: MANAGE_CONNECTORS_INGESTIONS_UUID,
        name: 'MANAGE_CONNECTORS_INGESTIONS',
      },
    ])
    .onConflict('name')
    .ignore();
}

/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('CapabilityPortal')
    .where({
      id: MANAGE_DEPLOYMENT_UUID,
      name: 'MANAGE_DEPLOYMENT',
    })
    .orWhere({
      id: MANAGE_CONNECTORS_INGESTIONS_UUID,
      name: 'MANAGE_CONNECTORS_INGESTIONS',
    })
    .delete();
}
