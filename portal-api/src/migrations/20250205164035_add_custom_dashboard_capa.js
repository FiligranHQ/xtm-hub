/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const serviceDefinitions = await knex('ServiceDefinition')
    .select('id')
    .where({ identifier: 'custom_dashboards' });

  for (const serviceDefinition of serviceDefinitions) {
    await knex.batchInsert('Service_Capability', [
      {
        id: knex.fn.uuid(),
        name: 'UPLOAD',
        description:
          'People from this organization can upload custom dashboards in this service.',
        service_definition_id: serviceDefinition.id,
      },
      {
        id: knex.fn.uuid(),
        name: 'DELETE',
        description:
          'People from this organization can delete custom dashboards in this service.',
        service_definition_id: serviceDefinition.id,
      },
    ]);
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const serviceDefinitions = await knex('ServiceDefinition')
    .select('id')
    .where({ identifier: 'custom_dashboards' });

  await knex('Service_Capability')
    .whereIn(
      'service_definition_id',
      serviceDefinitions.map((def) => def.id)
    )
    .whereIn('name', ['UPLOAD', 'DELETE'])
    .delete();
}
