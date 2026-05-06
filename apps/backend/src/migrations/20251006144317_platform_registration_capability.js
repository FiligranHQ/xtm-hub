/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex
    .table('UserOrganization_Capability')
    .update({
      name: 'MANAGE_PLATFORM_REGISTRATION',
    })
    .where('name', '=', 'MANAGE_OPENCTI_REGISTRATION')
    .orWhere('name', '=', 'MANAGE_OPENAEV_REGISTRATION');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex
    .table('UserOrganization_Capability')
    .update({
      name: 'MANAGE_OPENCTI_REGISTRATION',
    })
    .where('name', '=', 'MANAGE_PLATFORM_REGISTRATION');
}
