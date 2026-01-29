/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.renameTable('Label', 'UseCase');

  await knex.schema.renameTable('Object_Label', 'Object_UseCase');
  await knex.schema.table('Object_UseCase', function (table) {
    table.renameColumn('label_id', 'use_case_id');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.renameTable('UseCase', 'Label');
  await knex.schema.renameTable('Object_UseCase', 'Object_Label');
  await knex.schema.table('Object_Label', function (table) {
    table.renameColumn('use_case_id', 'label_id');
  });
}
