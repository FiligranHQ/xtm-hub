/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('Subscription_Capability', function (table) {
    table.dropForeign(['subscription_id']);

    table
      .foreign('subscription_id')
      .references('id')
      .inTable('Subscription')
      .onDelete('CASCADE');
  });
  await knex('Service_Capability')
    .where({ name: 'Upload' })
    .update({ name: 'UPLOAD' });

  await knex('Service_Capability')
    .where({ name: 'Delete' })
    .update({ name: 'DELETE' });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('Subscription_Capability', function (table) {
    table.dropForeign(['subscription_id']);

    table.foreign('subscription_id').references('id').inTable('Subscription');
  });
  await knex('Service_Capability')
    .where({ name: 'UPLOAD' })
    .update({ name: 'Upload' });

  await knex('Service_Capability')
    .where({ name: 'DELETE' })
    .update({ name: 'Delete' });
}
