export async function up(knex) {
  await knex.schema.createTable('NewsFeedItem', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('type').notNullable();
    table
      .uuid('service_instance_id')
      .notNullable()
      .references('id')
      .inTable('ServiceInstance')
      .onDelete('CASCADE');
    table.string('platform_identifier').notNullable();
    table.string('title').notNullable();
    table.timestamp('creation_date').notNullable().defaultTo(knex.fn.now());
    table.specificType('tags', 'text[]').defaultTo('{}');
  });

  await knex.schema.createTable('NewsFeedItemMetadata', (table) => {
    table
      .uuid('news_feed_item_id')
      .notNullable()
      .references('id')
      .inTable('NewsFeedItem')
      .onDelete('CASCADE');
    table.string('key').notNullable();
    table.text('value');
    table.primary(['news_feed_item_id', 'key']);
  });

  await knex.schema.createTable('ProvisionedNewsFeedItem', (table) => {
    table
      .uuid('news_feed_item_id')
      .notNullable()
      .references('id')
      .inTable('NewsFeedItem')
      .onDelete('CASCADE');
    table.string('platform_id').notNullable();
    table.primary(['news_feed_item_id', 'platform_id']);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('ProvisionedNewsFeedItem');
  await knex.schema.dropTableIfExists('NewsFeedItemMetadata');
  await knex.schema.dropTableIfExists('NewsFeedItem');
}
