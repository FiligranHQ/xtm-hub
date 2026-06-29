/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('PlatformConfiguration', (table) => {
    table.index('token', 'idx_platform_configuration_token');
    table.index('tenant_id', 'idx_platform_configuration_tenant_id');
    table.unique(['platform_id'], {
      indexName: 'uq_platform_configuration_platform_id',
    });
  });

  await knex.raw(`
    ALTER TABLE "ProvisionedNewsFeedItem"
    ALTER COLUMN "platform_id" TYPE uuid
    USING "platform_id"::uuid
  `);

  await knex.schema.alterTable('ProvisionedNewsFeedItem', (table) => {
    table.index('platform_id', 'idx_provisioned_news_feed_item_platform_id');
    table
      .foreign('platform_id')
      .references('platform_id')
      .inTable('PlatformConfiguration');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('ProvisionedNewsFeedItem', (table) => {
    table.dropForeign(['platform_id']);
    table.dropIndex(
      'platform_id',
      'idx_provisioned_news_feed_item_platform_id'
    );
  });

  await knex.schema.alterTable('PlatformConfiguration', (table) => {
    table.dropIndex('token', 'idx_platform_configuration_token');
    table.dropIndex('tenant_id', 'idx_platform_configuration_tenant_id');
    table.dropUnique(['platform_id'], 'uq_platform_configuration_platform_id');
  });

  await knex.raw(`
    ALTER TABLE "ProvisionedNewsFeedItem"
    ALTER COLUMN "platform_id" TYPE text
    USING "platform_id"::text
  `);
}
