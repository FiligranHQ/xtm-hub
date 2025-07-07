/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
import { v4 as uuidv4 } from 'uuid';
import * as z from 'zod/v4';

export async function up(knex) {
  const serviceDefinitionId = uuidv4();

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

  const schema = z.object({
    enroller_id: z.uuid().nonempty(),
    platform_id: z.uuid().nonempty(),
    platform_url: z.string().nonempty(),
    platform_title: z.string().nonempty(),
    token: z.string().nonempty(),
  });

  await knex('Service_Contract').insert([
    {
      service_definition_id: serviceDefinitionId,
      schema: z.toJSONSchema(schema),
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
