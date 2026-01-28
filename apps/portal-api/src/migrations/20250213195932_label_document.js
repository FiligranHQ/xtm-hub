/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('Object_Label', (table) => {
    table.uuid('object_id').references('id');
    table.uuid('use_case_id').references('id').inTable('UseCase');
    table.primary(['object_id', 'use_case_id']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('Object_Label');
}
