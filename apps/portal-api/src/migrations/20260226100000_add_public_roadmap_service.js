import { v4 as uuidv4 } from 'uuid';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const trx = await knex.transaction();

  const serviceDefinitionId = uuidv4();
  const serviceInstanceId = uuidv4();
  try {
    await knex('ServiceDefinition')
      .insert([
        {
          id: serviceDefinitionId,
          name: 'Public Roadmap',
          description: 'Explore and follow the Filigran XTM Suite roadmap',
          public: true,
          identifier: 'public_roadmap',
        },
      ])
      .onConflict('id')
      .ignore()
      .transacting(trx);

    await knex('ServiceInstance')
      .insert([
        {
          id: serviceInstanceId,
          name: 'Public Roadmap',
          description: 'Explore and follow the Filigran XTM Suite roadmap.',
          service_definition_id: serviceDefinitionId,
          public: false,
          slug: 'public-roadmap',
          join_type: 'JOIN_AUTO',
        },
      ])
      .onConflict('id')
      .ignore()
      .transacting(trx);

    await knex('Service_Link')
      .insert([
        {
          id: uuidv4(),
          service_instance_id: serviceInstanceId,
          url: '',
          name: 'Public Roadmap',
        },
      ])
      .onConflict('id')
      .ignore()
      .transacting(trx);

    await knex('Service_Capability')
      .insert([
        {
          id: uuidv4(),
          name: 'UPSERT',
          description: 'The user can insert and update new epics',
          service_definition_id: serviceDefinitionId,
        },
        {
          id: uuidv4(),
          name: 'DELETE',
          description: 'The user can delete epics',
          service_definition_id: serviceDefinitionId,
        },
      ])
      .onConflict('id')
      .ignore()
      .transacting(trx);
    await trx.commit();
  } catch (err) {
    await trx.rollback();
    throw err;
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const trx = await knex.transaction();

  try {
    await knex
      .delete()
      .from('Service_Link')
      .where({ name: 'Public Roadmap' })
      .transacting(trx);
    await knex
      .delete()
      .from('Service_Capability')
      .where({ description: 'The user can delete epics' })
      .orWhere({ description: 'The user can insert and update new epics' })
      .transacting(trx);
    await knex
      .delete()
      .from('ServiceInstance')
      .where({ name: 'Public Roadmap' })
      .transacting(trx);
    await knex
      .delete()
      .from('ServiceDefinition')
      .where({ name: 'Public Roadmap' })
      .transacting(trx);

    await trx.commit();
  } catch (err) {
    await trx.rollback();
    throw err;
  }
}
