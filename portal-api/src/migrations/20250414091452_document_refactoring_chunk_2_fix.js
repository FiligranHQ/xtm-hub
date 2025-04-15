/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex('Document').whereNull('type').update({ type: 'unknown' });

  await knex.schema.alterTable('Document', function (table) {
    table.string('type').notNullable().alter();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('Document', function (table) {
    table.string('type').nullable().alter();
  });
}
