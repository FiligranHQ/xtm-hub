const SLUGS_BY_NAME = {
  'OpenCTI Demo': 'opencti-demo',
  'OpenAEV Demo': 'openaev-demo',
  'OpenCTI Documentation': 'opencti-documentation',
  'OpenAEV Documentation': 'openaev-documentation',
  Slack: 'slack',
  'Filigran Blog': 'filigran-blog',
  'Filigran Academy': 'filigran-academy',
  'OpenCTI 101': 'opencti-101',
  'OpenAEV 101': 'openaev-101',
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  for (const [name, slug] of Object.entries(SLUGS_BY_NAME)) {
    await knex('ServiceInstance')
      .where({ name })
      .whereNull('slug')
      .update({ slug });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  for (const [name, slug] of Object.entries(SLUGS_BY_NAME)) {
    await knex('ServiceInstance').where({ name, slug }).update({ slug: null });
  }
}
