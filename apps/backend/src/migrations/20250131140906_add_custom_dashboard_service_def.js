import { v4 as uuidv4 } from 'uuid';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const serviceDefinitionId = uuidv4();
  const serviceInstanceId = uuidv4();

  // Delete previous public link service
  await knex
    .delete()
    .from('ServiceInstance')
    .where({ name: 'OpenCTI Custom Dashboards Library' });

  // Insert new service definition
  await knex('ServiceDefinition').insert([
    {
      id: serviceDefinitionId,
      name: 'OpenCTI Custom Dashboards Library',
      description:
        'Explore a range of custom dashboards created and shared by the Filigran team',
      public: true,
      identifier: 'custom_dashboards',
    },
  ]);

  // Insert new service instance
  await knex('ServiceInstance').insert([
    {
      id: serviceInstanceId,
      name: 'OpenCTI Custom Dashboards Library',
      description:
        'Explore a range of custom dashboards created and shared by the Filigran team',
      creation_status: 'READY',
      public: true,
      join_type: 'JOIN_AUTO',
      tags: ['openCTI'],
      service_definition_id: serviceDefinitionId,
    },
  ]);

  // Insert new service link
  await knex('Service_Link').insert([
    {
      id: uuidv4(),
      name: 'Dashboards',
      url: '',
      service_instance_id: serviceInstanceId,
    },
  ]);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const serviceDefs = await knex('ServiceDefinition')
    .where({ identifier: 'custom_dashboards' })
    .select('id');
  for (const serviceDef of serviceDefs) {
    await knex
      .delete()
      .from('ServiceInstance')
      .where({ service_definition_id: serviceDef.id });
    await knex.delete().from('ServiceDefinition').where({ id: serviceDef.id });
  }

  // Re-insert deleted public service
  const linkServiceDef = await knex('ServiceDefinition')
    .where({ identifier: 'link' })
    .select('id');
  await knex('ServiceInstance').insert([
    {
      id: uuidv4(),
      name: 'OpenCTI Custom Dashboards Library',
      description: '',
      creation_status: 'PENDING',
      public: true,
      join_type: 'JOIN_AUTO',
      tags: ['openCTI'],
      service_definition_id: linkServiceDef[0].id,
    },
  ]);
}
