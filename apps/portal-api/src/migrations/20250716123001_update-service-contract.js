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
    platform_url: { type: 'string', minLength: 1, format: 'uri' },
    platform_title: { type: 'string', minLength: 1 },
    platform_contract: { type: 'string', minLength: 1 },
    token: { type: 'string', minLength: 1 },
  },
  required: [
    'enroller_id',
    'platform_id',
    'platform_url',
    'platform_title',
    'platform_contract',
    'token',
  ],
  additionalProperties: false,
};

const serviceDefinitionId = '5f769173-5ace-4ef3-b04f-2c95609c5b59';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex('Service_Contract')
    .where('service_definition_id', serviceDefinitionId)
    .update('schema', jsonSchema);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Old schema
  await knex('Service_Contract')
    .where('service_definition_id', serviceDefinitionId)
    .update('schema', {
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
        platform_url: { type: 'string', minLength: 1, format: 'uri' },
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
    });
}
