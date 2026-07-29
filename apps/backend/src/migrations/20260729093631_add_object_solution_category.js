/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('Object_SolutionCategory', (table) => {
    table
      .uuid('object_id')
      .notNullable()
      .references('id')
      .inTable('Document')
      .onDelete('CASCADE');
    table
      .uuid('solution_category_id')
      .notNullable()
      .references('id')
      .inTable('SolutionCategory');
    table.primary(['object_id', 'solution_category_id']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('Object_SolutionCategory');
}
