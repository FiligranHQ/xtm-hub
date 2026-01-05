/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex('ServiceDefinition')
    .update({
      identifier: 'opencti_integrations',
      name: 'OpenCTI Integrations Library',
    })
    .where('identifier', '=', 'opencti_integration_feeds');
  await knex('ServiceInstance')
    .update({
      slug: 'open-cti-integrations',
      name: 'OpenCTI Integrations Library',
      description:
        'Explore a range of OpenCTI Integrations shared by the Filigran team.',
    })
    .where('slug', '=', 'open-cti-integration-feeds');
  await knex('Service_Capability')
    .update({
      description: 'The user can upload OpenCTI Integrations in this service.',
    })
    .where(
      'description',
      '=',
      'The user can upload OpenCTI Integration Feeds in this service.'
    );
  await knex('Service_Capability')
    .update({
      description: 'The user can delete OpenCTI Integrations in this service.',
    })
    .where(
      'description',
      '=',
      'The user can delete OpenCTI Integration Feeds in this service.'
    );
  await knex('Document')
    .update({
      type: 'opencti_integration',
    })
    .where('type', '=', 'opencti_integration_feed');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('ServiceDefinition')
    .update({
      identifier: 'opencti_integration_feeds',
      name: 'OpenCTI Integration Feeds Library',
    })
    .where('identifier', '=', 'opencti_integrations');
  await knex('ServiceInstance')
    .update({
      slug: 'open-cti-integration-feeds',
      name: 'OpenCTI Integration Feeds Library',
      description:
        'Explore a range of OpenCTI Integration Feeds shared by the Filigran team.',
    })
    .where('slug', '=', 'open-cti-integrations');
  await knex('Document')
    .update({
      type: 'opencti_integration_feed',
    })
    .where('type', '=', 'opencti_integration');
  await knex('Service_Capability')
    .update({
      description:
        'The user can upload OpenCTI Integration Feeds in this service.',
    })
    .where(
      'description',
      '=',
      'The user can upload OpenCTI Integrations in this service.'
    );
  await knex('Service_Capability')
    .update({
      description:
        'The user can delete OpenCTI Integration Feeds in this service.',
    })
    .where(
      'description',
      '=',
      'The user can delete OpenCTI Integrations in this service.'
    );
}
