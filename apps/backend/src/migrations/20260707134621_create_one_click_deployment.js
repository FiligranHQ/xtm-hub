/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('OneClickDeployment', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('source_event_id').notNullable().unique();
    table.text('resource_id').notNullable();
    table.text('resource_title').nullable();
    table.text('platform_id').notNullable();
    table.text('platform_version').nullable();
    table
      .uuid('organization_id')
      .nullable()
      .references('id')
      .inTable('Organization');
    table.uuid('user_id').nullable().references('id').inTable('User');
    table.enum('target_product', ['open-cti', 'open-aev']).notNullable();
    table.text('service').notNullable();
    table.text('tenant_id').nullable();
    table
      .timestamp('deployed_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index('resource_id');
    table.index('platform_id');
    table.index('organization_id');
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
