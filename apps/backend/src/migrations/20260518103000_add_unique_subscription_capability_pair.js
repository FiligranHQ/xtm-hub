/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('Subscription_Capability', (table) => {
    table.unique(['subscription_id', 'service_capability_id'], {
      indexName:
        'subscription_capability_subscription_service_capability_unique',
    });
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('Subscription_Capability', (table) => {
    table.dropUnique(
      ['subscription_id', 'service_capability_id'],
      'subscription_capability_subscription_service_capability_unique'
    );
  });
}
