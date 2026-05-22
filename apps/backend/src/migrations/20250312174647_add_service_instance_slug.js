/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table('ServiceInstance', function (table) {
    table.string('slug').nullable();
  });
  await knex('ServiceInstance')
    .where({ name: 'OpenCTI Custom Dashboards Library' })
    .update({
      slug: 'custom-open-cti-dashboards',
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table('ServiceInstance', function (table) {
    table.dropColumn('slug');
  });
}
