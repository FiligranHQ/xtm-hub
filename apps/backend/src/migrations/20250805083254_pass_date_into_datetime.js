/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Pass subscriptions dates :
  await knex.schema.alterTable('Subscription', (table) => {
    table.dateTime('start_date_tmp');
  });

  await knex.raw(`
    UPDATE "Subscription"
    SET start_date_tmp = start_date
  `);

  await knex.schema.alterTable('Subscription', (table) => {
    table.dropColumn('start_date');
  });

  await knex.schema.alterTable('Subscription', (table) => {
    table.dateTime('start_date').nullable();
  });

  await knex.raw(`
    UPDATE "Subscription"
    SET start_date = start_date_tmp
  `);

  await knex.schema.alterTable('Subscription', (table) => {
    table.dropColumn('start_date_tmp');
    table.dropColumn('end_date');
  });
  // Update Service_Price
  await knex.schema.alterTable('Subscription', (table) => {
    table.dateTime('end_date').nullable();
  });

  await knex.schema.alterTable('Service_Price', (table) => {
    table.dropColumn('start_date');
  });
  await knex.schema.alterTable('Service_Price', (table) => {
    table.dateTime('start_date').nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('Subscription', (table) => {
    table.date('start_date_tmp');
  });

  await knex.raw(`
    UPDATE "Subscription"
    SET start_date_tmp = start_date
  `);

  await knex.schema.alterTable('Subscription', (table) => {
    table.dropColumn('start_date');
  });

  await knex.schema.alterTable('Subscription', (table) => {
    table.date('start_date');
  });

  await knex.raw(`
    UPDATE "Subscription"
    SET start_date = start_date_tmp
  `);

  await knex.schema.alterTable('Subscription', (table) => {
    table.dropColumn('start_date_tmp');
    table.dropColumn('end_date');
  });
  await knex.schema.alterTable('Subscription', (table) => {
    table.dropColumn('start_date_tmp');
    table.date('end_date');
  });

  // Update Service_Price
  await knex.schema.alterTable('Service_Price', (table) => {
    table.dropColumn('start_date');
  });
  await knex.schema.alterTable('Service_Price', (table) => {
    table.date('start_date').nullable();
  });
}
