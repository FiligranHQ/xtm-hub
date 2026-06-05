/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */

const activeStatus = 'active';
const statusValues = ['active', 'inactive'];

const permissiveRegistrationSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  additionalProperties: true,
};

const platformConfigurationMergeColumns = [
  'registerer_id',
  'platform_id',
  'tenant_id',
  'tenant_name',
  'platform_url',
  'platform_title',
  'platform_version',
  'platform_contract',
  'token',
  'status',
  'last_connectivity_check',
];

const serviceConfigurationMergeColumns = ['config', 'status'];

export async function up(knex) {
  await knex.schema.createTable('PlatformConfiguration', (table) => {
    table.uuid('service_instance_id', { primaryKey: true });
    table
      .foreign('service_instance_id')
      .references('id')
      .inTable('ServiceInstance');

    table.uuid('registerer_id').notNullable();
    table.uuid('platform_id').notNullable();
    table.uuid('tenant_id').nullable();
    table.text('tenant_name').nullable();
    table.text('platform_url').notNullable();
    table.text('platform_title').notNullable();
    table.text('platform_version').nullable();
    table.text('platform_contract').notNullable();
    table.datetime('last_connectivity_check').nullable();
    table.uuid('token').notNullable();
    table.enum('status', statusValues).notNullable().defaultTo(activeStatus);
  });

  await knex('PlatformConfiguration')
    .insert(
      knex('Service_Configuration').select([
        'service_instance_id',
        knex.raw("(config->>'registerer_id')::uuid as registerer_id"),
        knex.raw("(config->>'platform_id')::uuid as platform_id"),
        knex.raw("(config->>'tenant_id')::uuid as tenant_id"),
        knex.raw("config->>'tenant_name' as tenant_name"),
        knex.raw("config->>'platform_url' as platform_url"),
        knex.raw("config->>'platform_title' as platform_title"),
        knex.raw("config->>'platform_version' as platform_version"),
        knex.raw("config->>'platform_contract' as platform_contract"),
        knex.raw(
          "(config->>'last_connectivity_check')::timestamptz as last_connectivity_check"
        ),
        knex.raw("(config->>'token')::uuid as token"),
        knex.raw(`coalesce(status, '${activeStatus}') as status`),
      ])
    )
    .onConflict('service_instance_id')
    .merge(platformConfigurationMergeColumns);

  await knex.schema.dropTable('Service_Configuration');

  await knex.schema.dropTable('Service_Contract');
}

/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.createTable('Service_Contract', (table) => {
    table.uuid('service_definition_id', { primaryKey: true });
    table
      .foreign('service_definition_id')
      .references('id')
      .inTable('ServiceDefinition');

    table.jsonb('schema').notNullable();
  });

  await knex.schema.createTable('Service_Configuration', (table) => {
    table.uuid('service_instance_id', { primaryKey: true });
    table
      .foreign('service_instance_id')
      .references('id')
      .inTable('ServiceInstance');

    table.jsonb('config').notNullable();
    table.enum('status', statusValues).defaultTo(activeStatus);
  });

  await knex('Service_Configuration')
    .insert(
      knex('PlatformConfiguration').select([
        'service_instance_id',
        knex.raw(`
            jsonb_strip_nulls(
              jsonb_build_object(
                'registerer_id', registerer_id,
                'platform_id', platform_id,
                'tenant_id', tenant_id,
                'tenant_name', tenant_name,
                'platform_url', platform_url,
                'platform_title', platform_title,
                'platform_version', platform_version,
                'platform_contract', platform_contract,
                'last_connectivity_check', last_connectivity_check,
                'token', token
              )
            ) as config
          `),
        knex.raw(`coalesce(status, '${activeStatus}') as status`),
      ])
    )
    .onConflict('service_instance_id')
    .merge(serviceConfigurationMergeColumns);

  await knex('Service_Contract')
    .insert(
      knex('ServiceInstance')
        .join(
          'PlatformConfiguration',
          'PlatformConfiguration.service_instance_id',
          '=',
          'ServiceInstance.id'
        )
        .distinct(
          'ServiceInstance.service_definition_id as service_definition_id'
        )
        .select(
          knex.raw('?::jsonb as schema', [
            JSON.stringify(permissiveRegistrationSchema),
          ])
        )
    )
    .onConflict('service_definition_id')
    .ignore();

  await knex.schema.dropTable('PlatformConfiguration');
}
