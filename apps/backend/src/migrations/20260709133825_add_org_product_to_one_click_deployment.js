/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('OneClickDeployment', (table) => {
    table.uuid('organization_id').nullable();
    table.text('target_product').nullable();

    table.index(['organization_id', 'target_product', 'deployed_at']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('OneClickDeployment', (table) => {
    table.dropColumn('organization_id');
    table.dropColumn('target_product');
  });
}
