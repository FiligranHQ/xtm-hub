/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

// jsonSchema was generated in a separate process using zod.toJSONSchema
// it was not possible to import zod directly here
const jsonSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    enroller_id: {
      type: 'string',
      minLength: 1,
      format: 'uuid',
      pattern:
        '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$',
    },
    platform_id: {
      type: 'string',
      minLength: 1,
      format: 'uuid',
      pattern:
        '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$',
    },
    platform_url: { type: 'string', minLength: 1 },
    platform_title: { type: 'string', minLength: 1 },
    token: { type: 'string', minLength: 1 },
  },
  required: [
    'enroller_id',
    'platform_id',
    'platform_url',
    'platform_title',
    'token',
  ],
  additionalProperties: false,
};

export async function up(knex) {
  const serviceDefinitionId = '5f769173-5ace-4ef3-b04f-2c95609c5b59';

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
  });

  await knex('ServiceDefinition').insert([
    {
      id: serviceDefinitionId,
      name: 'OpenCTI Enrollment',
      description: 'Enroll your OpenCTI instance',
      public: false,
      identifier: 'octi_enrollment',
    },
  ]);

  await knex('Service_Contract').insert([
    {
      service_definition_id: serviceDefinitionId,
      schema: jsonSchema,
    },
  ]);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('Service_Contract');
  await knex.schema.dropTable('Service_Configuration');
}
