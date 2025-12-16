/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
import { v4 as uuidv4 } from 'uuid';

export async function up(knex) {
  const serviceInstanceId = uuidv4();
  const linkServiceDefinition = await knex('ServiceDefinition')
    .where('identifier', '=', 'link')
    .select('id')
    .first();
  if (!linkServiceDefinition?.id) {
    throw new Error('Service definition not found');
  }

  await knex('ServiceInstance').insert({
    id: serviceInstanceId,
    name: 'OpenAEV 101',
    description:
      "Discover how to deploy and use OpenAEV, Filigran's platform for realistic cyber-threat simulation, to build hands-on adversary emulation exercises.",
    creation_status: 'READY',
    public: false,
    join_type: 'JOIN_AUTO',
    tags: ['openAEV', 'trial'],
    service_definition_id: linkServiceDefinition.id,
  });

  await knex('Service_Link').insert({
    id: uuidv4(),
    service_instance_id: serviceInstanceId,
    url: 'https://academy.filigran.io/course/getting-started-with-openaev',
    name: 'OpenAEV 101',
  });

  await knex('ServiceInstance')
    .update({
      tags: ['openCTI', 'openAEV', 'trial'],
    })
    .where({
      name: 'Filigran Blog',
    });

  await knex('ServiceInstance')
    .update({
      tags: ['openAEV', 'trial'],
    })
    .where('name', 'ILIKE', 'OpenAEV%Demo');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('ServiceInstance').where('name', '=', 'OpenAEV 101').del();
  await knex('ServiceInstance')
    .update({
      tags: ['openCTI', 'trial'],
    })
    .where({
      name: 'Filigran Blog',
    });

  await knex('ServiceInstance')
    .update({
      tags: ['openAEV'],
    })
    .where('name', 'ILIKE', 'OpenAEV%Demo');
}
