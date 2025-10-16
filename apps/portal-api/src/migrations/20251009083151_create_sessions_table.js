/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('sessions', (table) => {
    table.string('sid', 255).primary();
    table.jsonb('sess').notNullable();
    table.timestamp('expire').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Index for efficient cleanup of expired sessions
    table.index(['expire'], 'idx_sessions_expire');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('sessions');
}
