const LAST_CONNECTION_CHECK_PROPERTY = {
  type: 'string',
  format: 'string',
};

const addConnectionPropertiesToSchema = (schema) => {
  const properties =
    schema?.properties && typeof schema.properties === 'object'
      ? schema.properties
      : {};

  return {
    ...schema,
    required: [...schema.required, 'last_connection_check'],
    properties: {
      ...properties,
      last_connection_check: LAST_CONNECTION_CHECK_PROPERTY,
    },
  };
};

const removeConnectionPropertiesFromSchema = (schema) => {
  if (!schema?.properties || typeof schema.properties !== 'object') {
    return schema;
  }

  const { last_connection_check: _last_connection_check, ...properties } =
    schema.properties;

  return {
    ...schema,
    required: Array.isArray(schema.required)
      ? schema.required.filter((field) => field !== 'last_connection_check')
      : schema.required,
    properties,
  };
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const serviceContracts = await knex('Service_Contract').select('*');

  await Promise.all(
    serviceContracts.map(({ service_definition_id, schema }) => {
      const newSchema = addConnectionPropertiesToSchema(schema);
      return knex('Service_Contract')
        .update({ schema: newSchema })
        .where('service_definition_id', '=', service_definition_id);
    })
  );
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const serviceContracts = await knex('Service_Contract').select('*');

  await Promise.all(
    serviceContracts.map(({ service_definition_id, schema }) => {
      const oldSchema = removeConnectionPropertiesFromSchema(schema);
      return knex('Service_Contract')
        .update({ schema: oldSchema })
        .where('service_definition_id', '=', service_definition_id);
    })
  );
}
