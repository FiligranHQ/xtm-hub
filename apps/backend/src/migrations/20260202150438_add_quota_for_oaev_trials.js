/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const values = [
    {
      region: 'apac_au',
      capacity: 10,
      availability: 10,
      platform_identifier: 'openaev',
    },
    {
      region: 'apac_sg',
      capacity: 10,
      availability: 10,
      platform_identifier: 'openaev',
    },
    {
      region: 'eu_west',
      capacity: 20,
      availability: 20,
      platform_identifier: 'openaev',
    },
    {
      region: 'us_east',
      capacity: 20,
      availability: 20,
      platform_identifier: 'openaev',
    },
  ];

  await knex('DeploymentRequestQuota').insert(values);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('DeploymentRequestQuota')
    .where('DeploymentRequestQuota.platform_identifier', '=', 'openaev')
    .del();
}
