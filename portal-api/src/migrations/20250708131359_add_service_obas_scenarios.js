/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const trx = await knex.transaction();

  try {
    await knex('ServiceDefinition')
      .insert([
        {
          id: '85750de2-1cac-4bda-920f-05382a810d8f',
          name: 'OpenBAS Scenarios Library',
          description:
            'Explore a range of OpenBAS Scenarios shared by the Filigran team',
          public: true,
          identifier: 'obas_scenarios',
        },
      ])
      .onConflict('id')
      .ignore()
      .transacting(trx);

    await knex('Service_Price')
      .insert([
        {
          id: 'ea221fbb-a8bc-42cb-9119-2a2d45039fff',
          service_definition_id: '85750de2-1cac-4bda-920f-05382a810d8f',
          fee_type: 'YEARLY',
          start_date: null,
          price: 0,
        },
      ])
      .onConflict('id')
      .ignore()
      .transacting(trx);

    await knex('ServiceInstance')
      .insert([
        {
          id: '8cc7e79d-f3a4-406b-bc7c-b3d64f8cc5c1',
          name: 'OpenBAS Scenarios Library',
          description:
            'Explore a range of OpenBAS Scenarios shared by the Filigran team.',
          service_definition_id: '85750de2-1cac-4bda-920f-05382a810d8f',
          public: true,
          slug: 'open-bas-scenarios',
          join_type: 'JOIN_AUTO',
        },
      ])
      .onConflict('id')
      .ignore()
      .transacting(trx);

    await knex('Service_Link')
      .insert([
        {
          id: '5bba5849-90b9-406f-82d2-4f16260926c4',
          service_instance_id: '8cc7e79d-f3a4-406b-bc7c-b3d64f8cc5c1',
          url: '',
          name: 'OpenBAS Scenarios Library',
        },
      ])
      .onConflict('id')
      .ignore()
      .transacting(trx);

    await knex('Service_Capability')
      .insert([
        {
          id: '48446978-4c3b-499d-8bd8-9d287d09ca8e',
          name: 'UPLOAD',
          description: 'The user can upload OpenBAS Scenarios in this service.',
          service_definition_id: '85750de2-1cac-4bda-920f-05382a810d8f',
        },
        {
          id: '6a0f3581-76bc-4a69-8c4c-6d6bb79c9818',
          name: 'DELETE',
          description: 'The user can delete OpenBAS Scenarios in this service.',
          service_definition_id: '85750de2-1cac-4bda-920f-05382a810d8f',
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
      .where({ id: '5bba5849-90b9-406f-82d2-4f16260926c4' })
      .transacting(trx);

    await knex
      .delete()
      .from('Service_Price')
      .where({ id: 'ea221fbb-a8bc-42cb-9119-2a2d45039fff' })
      .transacting(trx);

    await knex
      .delete()
      .from('Service_Capability')
      .where({ id: '48446978-4c3b-499d-8bd8-9d287d09ca8e' })
      .transacting(trx);

    await knex
      .delete()
      .from('Service_Capability')
      .where({ id: '6a0f3581-76bc-4a69-8c4c-6d6bb79c9818' })
      .transacting(trx);

    await knex
      .delete()
      .from('ServiceInstance')
      .where({ id: '8cc7e79d-f3a4-406b-bc7c-b3d64f8cc5c1' })
      .transacting(trx);

    await knex
      .delete()
      .from('ServiceDefinition')
      .where({ id: '85750de2-1cac-4bda-920f-05382a810d8f' })
      .transacting(trx);

    await trx.commit();
  } catch (err) {
    await trx.rollback();
    throw err;
  }
}
