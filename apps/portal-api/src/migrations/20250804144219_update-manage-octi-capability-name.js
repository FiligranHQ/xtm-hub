/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex
    .table('UserOrganization_Capability')
    .update({
      name: 'MANAGE_OPENCTI_REGISTRATION',
    })
    .where('name', '=', 'MANAGE_OCTI_ENROLLMENT');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex
    .table('UserOrganization_Capability')
    .update({
      name: 'MANAGE_OCTI_ENROLLMENT',
    })
    .where('name', '=', 'MANAGE_OPENCTI_REGISTRATION');
}
