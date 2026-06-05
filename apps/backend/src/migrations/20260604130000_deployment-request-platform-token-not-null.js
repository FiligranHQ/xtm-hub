/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('DeploymentRequest', (table) => {
    table.string('platform_token').notNullable().alter();
  });
}

/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('DeploymentRequest', (table) => {
    table.string('platform_token').nullable().alter();
  });
}
