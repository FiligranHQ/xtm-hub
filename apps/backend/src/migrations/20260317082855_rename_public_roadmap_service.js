/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex('ServiceDefinition')
    .update({
      identifier: 'xtm_suite_roadmap',
      name: 'XTM Suite Roadmap',
    })
    .where('identifier', '=', 'public_roadmap');
  await knex('ServiceInstance')
    .update({
      slug: 'xtm-suite-roadmap',
      name: 'XTM Suite Roadmap',
    })
    .where('slug', '=', 'public-roadmap');
  await knex('Service_Link')
    .update({
      name: 'XTM Suite Roadmap',
    })
    .where('name', '=', 'Public Roadmap');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('ServiceDefinition')
    .update({
      identifier: 'public_roadmap',
      name: 'Public Roadmap',
    })
    .where('identifier', '=', 'xtm_suite_roadmap');
  await knex('ServiceInstance')
    .update({
      slug: 'public-roadmap',
      name: 'Public Roadmap',
    })
    .where('slug', '=', 'xtm-suite-roadmap');
  await knex('Service_Link')
    .update({
      name: 'Public Roadmap',
    })
    .where('name', '=', 'XTM Suite Roadmap');
}
