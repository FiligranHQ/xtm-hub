const xtmoneServiceDefinitionId = '9b1f6a9e-2c3d-4e3a-8a4a-2b7c4d9f1a01';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('DeploymentRequest', (table) => {
    table
      .uuid('parent_id')
      .nullable()
      .references('id')
      .inTable('DeploymentRequest')
      .onDelete('SET NULL');
    table.string('url').nullable();
  });

  await knex('ServiceDefinition').insert([
    {
      id: xtmoneServiceDefinitionId,
      name: 'XTM One Registration',
      description: 'Access and manage your XTM One platform',
      public: false,
      identifier: 'xtmone_registration',
    },
  ]);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('ServiceDefinition')
    .where('id', '=', xtmoneServiceDefinitionId)
    .del();

  await knex.schema.alterTable('DeploymentRequest', (table) => {
    table.dropColumn('url');
    table.dropColumn('parent_id');
  });
}
