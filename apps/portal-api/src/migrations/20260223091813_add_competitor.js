/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('Competitor', (table) => {
    table.uuid('id', { primary: true }).defaultTo(knex.fn.uuid());
    table.string('name');
    table.string('tier');
    table.string('domain');
    table.unique(['domain'], {
      useConstraint: true,
      constraintName: 'competitor_domain_unique',
    });
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('Competitor');
}
