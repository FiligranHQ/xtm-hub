// jsonSchema was generated in a separate process using zod.toJSONSchema
// it was not possible to import zod directly here
const jsonSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    registerer_id: {
      type: 'string',
      minLength: 1,
      format: 'uuid',
      pattern:
        '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$',
    },
    platform_contract: { type: 'string', minLength: 1 },
    platform_id: {
      type: 'string',
      minLength: 1,
      format: 'uuid',
      pattern:
        '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$',
    },
    platform_url: { type: 'string', minLength: 1, format: 'uri' },
    platform_title: { type: 'string', minLength: 1 },
    platform_version: { type: 'string', minLength: 1 },
    token: { type: 'string', minLength: 1 },
  },
  required: [
    'registerer_id',
    'platform_contract',
    'platform_id',
    'platform_url',
    'platform_title',
    'platform_version',
    'token',
  ],
  additionalProperties: false,
};

const serviceDefinitionId = 'e66a6b50-1f92-4f62-b84c-88ed6b871790';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex('ServiceDefinition').insert([
    {
      id: serviceDefinitionId,
      name: 'OpenAEV Registration',
      description: 'Access and manage your OpenAEV platform',
      public: false,
      identifier: 'openaev_registration',
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
  await knex('ServiceDefinition').where('id', '=', serviceDefinitionId).del();
  await knex('Service_Contract')
    .where('service_definition_id', '=', serviceDefinitionId)
    .del();
}
