/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('Service_Capability', function (table) {
    table.uuid('id', { primaryKey: true }).defaultTo(knex.fn.uuid());
    table.string('name');
    table.string('description');
    table
      .uuid('service_definition_id')
      .references('id')
      .inTable('ServiceDefinition');
  });

  await knex.schema.createTable('Subscription_Capability', function (table) {
    table.uuid('id', { primaryKey: true }).defaultTo(knex.fn.uuid());
    table
      .uuid('service_capability_id')
      .references('id')
      .inTable('Service_Capability');
    table.uuid('subscription_id').references('id').inTable('Subscription');
  });

  await knex.schema.table('UserService_Capability', function (table) {
    table
      .uuid('subscription_capability_id')
      .references('id')
      .inTable('Subscription_Capability')
      .onDelete('CASCADE')
      .nullable();
  });

  // Add service capa for Vaults :
  const serviceDefinitions = await knex('ServiceDefinition').select();

  for (const serviceDefinition of serviceDefinitions) {
    if (serviceDefinition.identifier === 'vault') {
      await knex('Service_Capability').insert({
        id: knex.fn.uuid(),
        name: 'Upload',
        description:
          'people from this organization can upload documents in this service.',
        service_definition_id: serviceDefinition.id,
      });
      await knex('Service_Capability').insert({
        id: knex.fn.uuid(),
        name: 'Delete',
        description:
          'people from this organization can delete documents in this service.',
        service_definition_id: serviceDefinition.id,
      });
    }
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('Service_Capability');
  await knex.schema.dropTable('Subscription_Capability');
  await knex.schema.table('UserService_Capability', function (table) {
    table.dropColumn('subscription_capability_id');
  });
}
