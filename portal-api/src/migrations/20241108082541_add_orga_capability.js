/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table('Organization', function (table) {
    table.boolean('personal_space').defaultTo(false);
  });
  await knex('Organization')
    .whereIn('id', function () {
      this.select('id').from('User');
    })
    .update('personal_space', true);

  await knex.schema.createTable(
    'UserOrganization_Capability',
    function (table) {
      table.increments('id').primary();
      table
        .integer('user_organization_id')
        .references('id')
        .inTable('User_Organization')
        .onDelete('CASCADE');
      table.string('name').notNullable();
    }
  );
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table('Organization', function (table) {
    table.dropColumn('personal_space');
  });
  await knex.schema.dropTable('UserOrganization_Capability');
}
