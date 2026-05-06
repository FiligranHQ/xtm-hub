/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('Object_Label', (table) => {
    table.uuid('object_id').references('id');
    table.uuid('label_id').references('id').inTable('Label');
    table.primary(['object_id', 'label_id']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('Object_Label');
}
