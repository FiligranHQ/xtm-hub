export async function up(knex) {
  await knex.schema.alterTable('NewsFeedItem', (table) => {
    table.specificType('tags', 'text[]').notNullable().defaultTo('{}').alter();
    table.dropColumn('service_instance_id');
  });
}

export async function down(knex) {
  await knex.schema.alterTable('NewsFeedItem', (table) => {
    table.specificType('tags', 'text[]').nullable().defaultTo('{}').alter();
    table
      .uuid('service_instance_id')
      .notNullable()
      .references('id')
      .inTable('ServiceInstance')
      .onDelete('CASCADE');
  });
}
