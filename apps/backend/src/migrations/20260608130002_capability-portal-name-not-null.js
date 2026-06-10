/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('CapabilityPortal', (table) => {
    table.string('name').notNullable().alter();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('CapabilityPortal', (table) => {
    table.string('name').nullable().alter();
  });
}
