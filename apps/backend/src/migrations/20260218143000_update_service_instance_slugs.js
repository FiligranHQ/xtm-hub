/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex('ServiceInstance')
    .where('slug', 'like', 'open-cti-%')
    .update({
      slug: knex.raw("REPLACE(slug, 'open-cti-', 'opencti-')"),
    });

  await knex('ServiceInstance')
    .where('slug', 'like', 'open-aev-%')
    .update({
      slug: knex.raw("REPLACE(slug, 'open-aev-', 'openaev-')"),
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('ServiceInstance')
    .where('slug', 'like', 'opencti-%')
    .update({
      slug: knex.raw("REPLACE(slug, 'opencti-', 'open-cti-')"),
    });

  await knex('ServiceInstance')
    .where('slug', 'like', 'openaev-%')
    .update({
      slug: knex.raw("REPLACE(slug, 'openaev-', 'open-aev-')"),
    });
}
