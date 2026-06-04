/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('Epic', (table) => {
    table.boolean('active').notNullable().defaultTo(false).alter();
    table.uuid('uploader_id').notNullable().alter();
    table.text('description').notNullable().alter();
    table.string('timeline').notNullable().defaultTo('now').alter();
    table.string('epic_type').notNullable().defaultTo('other').alter();
  });

  await knex.schema.alterTable('RolePortal', (table) => {
    table.string('name').notNullable().defaultTo('').alter();
  });
}

/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('Epic', (table) => {
    table.boolean('active').nullable().alter();
    table.uuid('uploader_id').nullable().alter();
    table.text('description').nullable().alter();
    table.string('timeline').nullable().defaultTo('now').alter();
    table.string('epic_type').nullable().defaultTo('other').alter();
  });
  await knex.schema.alterTable('RolePortal', (table) => {
    table.string('name').nullable().alter();
  });
}
