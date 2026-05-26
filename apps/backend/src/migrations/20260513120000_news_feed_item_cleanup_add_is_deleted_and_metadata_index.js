/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Existing news feed records are intentionally purged
  // Rebuilding from a clean state avoids inconsistent historical data.
  await knex('NewsFeedItem').del();

  await knex.schema.alterTable('NewsFeedItem', function (table) {
    table.boolean('is_deleted').notNullable().defaultTo(false);
  });

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_news_feed_item_metadata_key_value
      ON "NewsFeedItemMetadata" (key, value);
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('NewsFeedItem', function (table) {
    table.dropColumn('is_deleted');
  });

  await knex.raw(`
    DROP INDEX IF EXISTS idx_news_feed_item_metadata_key_value;
  `);
}
