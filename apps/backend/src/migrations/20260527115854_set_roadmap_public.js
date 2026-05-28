/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Update to public
  await knex('ServiceInstance')
    .update({
      public: true,
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
      public: false,
    })
    .where('slug', '=', 'xtm-platform-roadmap');
}
