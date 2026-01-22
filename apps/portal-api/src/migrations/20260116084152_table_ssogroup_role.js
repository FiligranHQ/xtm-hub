/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable('SSOGroup_RolePortal', function (table) {
    table.text('SSOGroup').notNullable();
    table.text('RolePortal').notNullable();

    table.primary(['SSOGroup', 'RolePortal']);

    table
      .foreign('RolePortal')
      .references('name')
      .inTable('RolePortal')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists('SSOGroup_RolePortal');
}
