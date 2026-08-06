/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_subscription_organization_service_instance
    ON "Subscription" ("organization_id", "service_instance_id")
  `);

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_subscription_service_instance_id
    ON "Subscription" ("service_instance_id")
  `);

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_user_service_subscription_user
    ON "User_Service" ("subscription_id", "user_id")
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw(`DROP INDEX IF EXISTS idx_user_service_subscription_user`);
  await knex.raw(`DROP INDEX IF EXISTS idx_subscription_service_instance_id`);
  await knex.raw(
    `DROP INDEX IF EXISTS idx_subscription_organization_service_instance`
  );
}
