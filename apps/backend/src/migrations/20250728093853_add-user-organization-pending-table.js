/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Create the new User_Organization table
  await knex.schema.createTable('User_Organization_Pending', function (table) {
    table.increments('id').primary();
    table.uuid('user_id').references('id').inTable('User').onDelete('CASCADE');
    table
      .uuid('organization_id')
      .references('id')
      .inTable('Organization')
      .onDelete('CASCADE');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  //  Drop the User_Organization_Pending table
  await knex.schema.dropTable('User_Organization_Pending');
}
