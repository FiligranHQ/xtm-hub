/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex('DeploymentRequest').where({ hub_status: 'canceled' }).update({
    hub_status: 'cancelled',
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('DeploymentRequest').where({ hub_status: 'cancelled' }).update({
    hub_status: 'canceled',
  });
}
