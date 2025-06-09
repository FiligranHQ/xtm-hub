/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw(`
    UPDATE "ServiceInstance"
    SET "slug" = 'custom-open-cti-dashboards'
    WHERE "slug" = 'custom_open_cti_dashboards'
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw(`
    UPDATE "ServiceInstance"
    SET "slug" = 'custom_open_cti_dashboards'
    WHERE "slug" = 'custom-open-cti-dashboards'
  `);
}
