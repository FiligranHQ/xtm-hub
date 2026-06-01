const LAST_CONNECTIVITY_CHECK_PROPERTY = {
  type: 'string',
  format: 'date-time',
};

const addConnectivityPropertiesToSchema = (schema) => {
  const properties =
    schema?.properties && typeof schema.properties === 'object'
      ? schema.properties
      : {};

  return {
    ...schema,
    required: [...schema.required, 'last_connectivity_check'],
    properties: {
      ...properties,
      last_connectivity_check: LAST_CONNECTIVITY_CHECK_PROPERTY,
    },
  };
};

const removeConnectivityPropertiesFromSchema = (schema) => {
  if (!schema?.properties || typeof schema.properties !== 'object') {
    return schema;
  }

  const { last_connectivity_check: _last_connectivity_check, ...properties } =
    schema.properties;

  return {
    ...schema,
    required: Array.isArray(schema.required)
      ? schema.required.filter((field) => field !== 'last_connectivity_check')
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
      const newSchema = addConnectivityPropertiesToSchema(schema);
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
      const oldSchema = removeConnectivityPropertiesFromSchema(schema);
      return knex('Service_Contract')
        .update({ schema: oldSchema })
        .where('service_definition_id', '=', service_definition_id);
    })
  );
}
