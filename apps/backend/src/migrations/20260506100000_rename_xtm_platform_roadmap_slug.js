/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex('ServiceInstance')
    .update({
      slug: 'xtm-platform-roadmap',
      name: 'XTM Platform Roadmap',
      description:
        "Explore the XTM Platform roadmap to see what's coming across OpenCTI, OpenAEV, and XTM Hub — and stay ahead with full visibility into our product direction.",
    })
    .where('slug', '=', 'xtm-platform-roadmap');
  await knex('ServiceDefinition')
    .update({
      identifier: 'xtm_platform_roadmap',
      name: 'XTM Platform Roadmap',
      description: 'Explore and follow the Filigran XTM Platform roadmap',
    })
    .where('identifier', '=', 'xtm_platform_roadmap');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('ServiceInstance')
    .update({
      slug: 'xtm-platform-roadmap',
      name: 'XTM Platform Roadmap',
      description:
        "Explore the XTM Platform roadmap to see what's coming across OpenCTI, OpenAEV, and XTM Hub — and stay ahead with full visibility into our product direction.",
    })
    .where('slug', '=', 'xtm-platform-roadmap');

  await knex('ServiceDefinition')
    .update({
      identifier: 'xtm_platform_roadmap',
      name: 'XTM Platform Roadmap',
      description: 'Explore and follow the Filigran XTM Platform roadmap',
    })
    .where('identifier', '=', 'xtm_platform_roadmap');
}
