/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema
    .createTable('ServiceGroup', function (table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.uuid('service_instance_id').notNullable();
      table
        .foreign('service_instance_id')
        .references('id')
        .inTable('ServiceInstance')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
      table.unique(['name', 'service_instance_id']);
    })
    .createTable('ServiceGroup_User', function (table) {
      table.uuid('group_id').notNullable();
      table.uuid('user_id').notNullable();

      table
        .foreign('group_id')
        .references('id')
        .inTable('ServiceGroup')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table
        .foreign('user_id')
        .references('id')
        .inTable('User')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.unique(['group_id', 'user_id']);
    });
}
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema
    .dropTableIfExists('ServiceGroup_User')
    .dropTableIfExists('ServiceGroup');
}
