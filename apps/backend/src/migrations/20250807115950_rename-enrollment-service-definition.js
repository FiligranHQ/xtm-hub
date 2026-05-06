/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex('ServiceDefinition')
    .update({
      name: 'OpenCTI Registration',
      identifier: 'opencti_registration',
    })
    .where('identifier', '=', 'octi_enrollment');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('ServiceDefinition')
    .update({
      name: 'OpenCTI Instance',
      identifier: 'octi_enrollment',
    })
    .where('identifier', '=', 'opencti_registration');
}
