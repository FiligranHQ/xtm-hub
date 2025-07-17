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
          id: '42007953-4dbc-480a-8693-8c05f1123460',
          name: 'OpenCTI Integration Feeds Library',
          description:
            'Explore a range of OpenCTI Integration shared by the Filigran team',
          public: true,
          identifier: 'csv_feeds',
        },
      ])
      .onConflict('id')
      .ignore()
      .transacting(trx);

    await knex('Service_Price')
      .insert([
        {
          id: '275386af-36c2-4bb3-b0d8-f74d447b309e',
          service_definition_id: '42007953-4dbc-480a-8693-8c05f1123460',
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
          id: '0f4aad4b-bdd6-4084-8b1f-82c9c66578cc',
          name: 'OpenCTI Integration Feeds Library',
          description:
            'Explore a range of OpenCTI Integration Feeds shared by the Filigran team.',
          service_definition_id: '42007953-4dbc-480a-8693-8c05f1123460',
          public: true,
          slug: 'open-cti-integration-feeds',
          join_type: 'JOIN_AUTO',
        },
      ])
      .onConflict('id')
      .ignore()
      .transacting(trx);

    await knex('Service_Link')
      .insert([
        {
          id: '972ad779-675a-4dab-bee0-c67d6c22b7bd',
          service_instance_id: '0f4aad4b-bdd6-4084-8b1f-82c9c66578cc',
          url: '',
          name: 'OpenCTI Integration Library',
        },
      ])
      .onConflict('id')
      .ignore()
      .transacting(trx);

    await knex('Service_Capability')
      .insert([
        {
          id: '26611d56-e443-45fb-9f6c-cc6b9b8a5de9',
          name: 'UPLOAD',
          description:
            'The user can upload OpenCTI Integration Feeds in this service.',
          service_definition_id: '42007953-4dbc-480a-8693-8c05f1123460',
        },
        {
          id: '283e06b2-2d64-42c7-b432-890e69ac8b8f',
          name: 'DELETE',
          description:
            'The user can delete OpenCTI Integration Feeds in this service.',
          service_definition_id: '42007953-4dbc-480a-8693-8c05f1123460',
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
      .where({ id: '972ad779-675a-4dab-bee0-c67d6c22b7bd' })
      .transacting(trx);

    await knex
      .delete()
      .from('Service_Price')
      .where({ id: '275386af-36c2-4bb3-b0d8-f74d447b309e' })
      .transacting(trx);

    await knex
      .delete()
      .from('Service_Capability')
      .where({ id: '26611d56-e443-45fb-9f6c-cc6b9b8a5de9' })
      .transacting(trx);

    await knex
      .delete()
      .from('Service_Capability')
      .where({ id: '283e06b2-2d64-42c7-b432-890e69ac8b8f' })
      .transacting(trx);

    await knex
      .delete()
      .from('ServiceInstance')
      .where({ id: '0f4aad4b-bdd6-4084-8b1f-82c9c66578cc' })
      .transacting(trx);

    await knex
      .delete()
      .from('ServiceDefinition')
      .where({ id: '42007953-4dbc-480a-8693-8c05f1123460' })
      .transacting(trx);

    await trx.commit();
  } catch (err) {
    await trx.rollback();
    throw err;
  }
}
