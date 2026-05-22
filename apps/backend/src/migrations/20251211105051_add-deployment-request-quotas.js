/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('DeploymentRequestQuota', (table) => {
    table.uuid('id', { primary: true }).defaultTo(knex.fn.uuid());
    table.string('region');
    table.string('platform_identifier');
    table.integer('capacity');
    table.integer('availability');

    table.unique(['region', 'platform_identifier']);
    table.check('?? <= ??', ['availability', 'capacity']);
  });

  const values = [
    {
      region: 'apac_au',
      capacity: 10,
      availability: 10,
      platform_identifier: 'opencti',
    },
    {
      region: 'apac_sg',
      capacity: 10,
      availability: 10,
      platform_identifier: 'opencti',
    },
    {
      region: 'eu_west',
      capacity: 20,
      availability: 20,
      platform_identifier: 'opencti',
    },
    {
      region: 'us_east',
      capacity: 20,
      availability: 20,
      platform_identifier: 'opencti',
    },
  ];

  await knex('DeploymentRequestQuota').insert(values);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('DeploymentRequestQuota');
}
