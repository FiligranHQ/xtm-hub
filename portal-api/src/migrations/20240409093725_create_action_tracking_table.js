/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    // Create action tracking table
    await knex.schema.createTable('ActionTracking', (table) => {
        table.uuid('id', { primaryKey: true });
        table.string('type').notNullable();
        table.uuid('contextual_id').notNullable();
        table.string('status').defaultTo('INITIALISE');
        table.json('output');
    });

};

/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTable('ActionTracking');
};
