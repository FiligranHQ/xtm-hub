import { v4 as uuidv4 } from 'uuid';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const serviceDefinitionId = uuidv4();
  const serviceInstanceId = uuidv4();

  await knex('ServiceDefinition').insert([
    {
      id: serviceDefinitionId,
      name: 'OpenCTI Playbooks Library',
      description:
        'Explore a range of OpenCTI Playbooks shared by the Filigran team',
      public: true,
      identifier: 'opencti_playbooks',
    },
  ]);

  await knex('ServiceInstance').insert([
    {
      id: serviceInstanceId,
      name: 'OpenCTI Playbooks Library',
      description:
        'Explore a range of OpenCTI Playbooks shared by the Filigran team.',
      service_definition_id: serviceDefinitionId,
      public: true,
      slug: 'opencti-playbooks',
      tags: ['openCTI'],
    },
  ]);

  await knex('Service_Capability').insert([
    {
      id: uuidv4(),
      name: 'UPLOAD',
      description: 'The user can upload OpenCTI Playbooks in this service.',
      service_definition_id: serviceDefinitionId,
    },
    {
      id: uuidv4(),
      name: 'DELETE',
      description: 'The user can delete OpenCTI Playbooks in this service.',
      service_definition_id: serviceDefinitionId,
    },
  ]);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const serviceDefs = await knex('ServiceDefinition')
    .where({ identifier: 'opencti_playbooks' })
    .select('id');
  for (const serviceDef of serviceDefs) {
    await knex
      .delete()
      .from('Service_Capability')
      .where({ service_definition_id: serviceDef.id });
    await knex
      .delete()
      .from('ServiceInstance')
      .where({ service_definition_id: serviceDef.id });
    await knex.delete().from('ServiceDefinition').where({ id: serviceDef.id });
  }
}
