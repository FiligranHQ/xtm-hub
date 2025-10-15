/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex('Document')
    .update({ type: 'opencti_integration_feed' })
    .where('type', '=', 'csv_feed');

  await knex('ServiceDefinition')
    .update({ identifier: 'opencti_integration_feeds' })
    .where('identifier', '=', 'csv_feeds');

  await knex('Document')
    .update({ type: 'opencti_custom_dashboard' })
    .where('type', '=', 'custom_dashboard');

  await knex('ServiceDefinition')
    .update({ identifier: 'opencti_custom_dashboards' })
    .where('identifier', '=', 'custom_dashboards');
}
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('Document')
    .update({ type: 'csv_feed' })
    .where('type', '=', 'opencti_integration_feed');

  await knex('ServiceDefinition')
    .update({ identifier: 'csv_feeds' })
    .where('identifier', '=', 'opencti_integration_feeds');

  await knex('Document')
    .update({ type: 'custom_dashboard' })
    .where('type', '=', 'opencti_custom_dashboard');

  await knex('ServiceDefinition')
    .update({ identifier: 'custom_dashboards' })
    .where('identifier', '=', 'opencti_custom_dashboards');
}
