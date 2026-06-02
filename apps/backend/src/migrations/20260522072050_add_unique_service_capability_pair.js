/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw(`
    ALTER TABLE "UserService_Capability"
    ADD CONSTRAINT user_service_capability_user_service_generic_service_capability_subscription_capability_unique
    UNIQUE NULLS NOT DISTINCT (
      "user_service_id",
      "generic_service_capability_id",
      "subscription_capability_id"
    )
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw(`
    ALTER TABLE "UserService_Capability"
    DROP CONSTRAINT IF EXISTS user_service_capability_user_service_generic_service_capability_subscription_capability_unique
  `);
}
