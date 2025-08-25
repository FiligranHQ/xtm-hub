/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex('Document')
    .update({ type: 'openaev_scenario' })
    .where('type', '=', 'obas_scenario');
}
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('Document')
    .update({ type: 'obas_scenario' })
    .where('type', '=', 'openaev_scenario');
}
