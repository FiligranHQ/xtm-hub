/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('OneClickDeployment', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('resource_id').notNullable();
    table.text('platform_id').notNullable();
    table.text('tenant_id').nullable();
    table.uuid('user_id').nullable();
    table.timestamp('deployed_at', { useTz: true }).notNullable();

    table.index(['platform_id', 'tenant_id']);
    table.index('resource_id');
    table.index('deployed_at');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('OneClickDeployment');
}
