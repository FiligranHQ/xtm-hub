/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex('ServiceInstance')
    .update({
      description:
        "Explore the XTM Platform roadmap to see what's coming across OpenCTI, OpenAEV, and XTM Hub — and stay ahead with full visibility into our product direction.",
    })
    .where('slug', '=', 'xtm-platform-roadmap');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('ServiceInstance')
    .update({
      description: 'Explore and follow the Filigran XTM Platform roadmap.',
    })
    .where('slug', '=', 'xtm-platform-roadmap');
}
