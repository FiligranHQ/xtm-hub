/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('Organization', (table) => {
    table.string('name').notNullable().alter();
    table.boolean('personal_space').notNullable().defaultTo(false).alter();
  });

  await knex.schema.alterTable('User', (table) => {
    table.string('email').notNullable().alter();
  });

  await knex.schema.alterTable('UseCase', (table) => {
    table.string('name').notNullable().alter();
    table.string('color').notNullable().alter();
  });

  await knex.schema.alterTable('Document', (table) => {
    table.boolean('active').notNullable().defaultTo(true).alter();
  });

  await knex.schema.alterTable('Competitor', (table) => {
    table.string('name').notNullable().alter();
    table.string('tier').notNullable().alter();
    table.string('domain').notNullable().alter();
  });

  await knex.schema.alterTable('User_Service', (table) => {
    table.uuid('user_id').notNullable().alter();
    table.uuid('subscription_id').notNullable().alter();
  });

  await knex.schema.alterTable('ServiceDefinition', (table) => {
    table.string('name').notNullable().alter();
    table.string('identifier').notNullable().alter();
  });

  await knex.schema.alterTable('Subscription', (table) => {
    table.uuid('organization_id').notNullable().alter();
    table.uuid('service_instance_id').notNullable().alter();
  });

  await knex.schema.alterTable('ServiceInstance', (table) => {
    table.uuid('service_definition_id').notNullable().alter();
  });

  await knex.schema.alterTable('DeploymentRequestQuota', (table) => {
    table.uuid('id').notNullable().alter();
    table.string('region').notNullable().alter();
    table.string('platform_identifier').notNullable().alter();
    table.integer('capacity').notNullable().alter();
    table.integer('availability').notNullable().alter();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('Organization', (table) => {
    table.string('name').nullable().alter();
    table.boolean('personal_space').nullable().alter();
  });

  await knex.schema.alterTable('User', (table) => {
    table.string('email').nullable().alter();
  });

  await knex.schema.alterTable('UseCase', (table) => {
    table.string('name').nullable().alter();
    table.string('color').nullable().alter();
  });

  await knex.schema.alterTable('Document', (table) => {
    table.boolean('active').nullable().alter();
  });

  await knex.schema.alterTable('Competitor', (table) => {
    table.string('name').nullable().alter();
    table.string('tier').nullable().alter();
    table.string('domain').nullable().alter();
  });

  await knex.schema.alterTable('User_Service', (table) => {
    table.uuid('user_id').nullable().alter();
    table.uuid('subscription_id').nullable().alter();
  });

  await knex.schema.alterTable('ServiceDefinition', (table) => {
    table.string('name').nullable().alter();
    table.string('identifier').nullable().alter();
  });

  await knex.schema.alterTable('Subscription', (table) => {
    table.uuid('organization_id').nullable().alter();
    table.uuid('service_instance_id').nullable().alter();
  });

  await knex.schema.alterTable('ServiceInstance', (table) => {
    table.uuid('service_definition_id').nullable().alter();
  });

  await knex.schema.alterTable('DeploymentRequestQuota', (table) => {
    table.uuid('id').nullable().alter();
    table.string('region').nullable().alter();
    table.string('platform_identifier').nullable().alter();
    table.integer('capacity').nullable().alter();
    table.integer('availability').nullable().alter();
  });
}
