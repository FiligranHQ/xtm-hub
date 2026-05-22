/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex('ServiceInstance')
    .update({
      description:
        "Explore the XTM Suite roadmap to see what's coming across OpenCTI, OpenAEV, and XTM Hub — and stay ahead with full visibility into our product direction.",
    })
    .where('slug', '=', 'xtm-suite-roadmap');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('ServiceInstance')
    .update({
      description: 'Explore and follow the Filigran XTM Suite roadmap.',
    })
    .where('slug', '=', 'xtm-suite-roadmap');
}
