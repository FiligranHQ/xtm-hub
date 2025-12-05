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
    name: 'OpenCTI 101',
    description:
      'The fundamentals: discover the essential concepts with basic use cases and workflows.',
    creation_status: 'READY',
    public: false,
    join_type: 'JOIN_AUTO',
    tags: ['openCTI', 'trial'],
    service_definition_id: linkServiceDefinition.id,
  });

  await knex('Service_Link').insert({
    id: uuidv4(),
    service_instance_id: serviceInstanceId,
    url: 'https://academy.filigran.io/page/opencti-101',
    name: 'OpenCTI 101',
  });

  await knex('ServiceInstance')
    .update({
      tags: ['openCTI', 'trial'],
    })
    .where({
      name: 'Filigran Blog',
    })
    .orWhere('name', 'ILIKE', 'OpenCTI%Demo');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('ServiceInstance').where('name', '=', 'OpenCTI 101').del();
  await knex('ServiceInstance')
    .update({
      tags: ['openCTI'],
    })
    .where({
      name: 'Filigran Blog',
    })
    .orWhere('name', 'ILIKE', 'OpenCTI%Demo');
}
