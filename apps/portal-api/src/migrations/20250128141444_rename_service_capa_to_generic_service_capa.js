/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.renameTable(
    'Service_Capability',
    'Generic_Service_Capability'
  );
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.renameTable(
    'Generic_Service_Capability',
    'Service_Capability'
  );
}
