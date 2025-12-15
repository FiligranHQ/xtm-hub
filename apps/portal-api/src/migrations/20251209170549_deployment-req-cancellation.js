/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('DeploymentRequest', (table) => {
    table.boolean('counts_in_orga_quota').notNullable().defaultTo(true);
    table.uuid('cancellation_user_id').nullable();
    table.timestamp('cancellation_date').nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('DeploymentRequest', (table) => {
    table.dropColumn('counts_in_orga_quota');
    table.dropColumn('cancellation_user_id');
    table.dropColumn('cancellation_date');
  });
}
