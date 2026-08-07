const xtmPlatformBundleServiceDefinitionId =
  '9b1f6a9e-2c3d-4e3a-8a4a-2b7c4d9f1a02';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('DeploymentRequest', (table) => {
    table.string('platform_identifier').nullable().alter();
  });

  await knex('ServiceDefinition').insert([
    {
      id: xtmPlatformBundleServiceDefinitionId,
      name: 'XTM Platform Bundle',
      description: 'A bundle of several XTM platform trials',
      public: false,
      identifier: 'xtm_platform_bundle',
    },
  ]);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('ServiceDefinition')
    .where('id', '=', xtmPlatformBundleServiceDefinitionId)
    .del();

  await knex('DeploymentRequest').whereNull('platform_identifier').del();

  await knex.schema.alterTable('DeploymentRequest', (table) => {
    table.string('platform_identifier').notNullable().alter();
  });
}
