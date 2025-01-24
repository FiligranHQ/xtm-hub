import { v4 as uuidv4 } from 'uuid';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const link_serviceDef_id = uuidv4();
const vault_serviceDef_id = uuidv4();
const SERVICE_DEFINITION = {
  vault: {
    id: vault_serviceDef_id,
    name: 'Vault',
    description: 'Vault services to share information',
    public: true,
  },
  links: {
    id: link_serviceDef_id,
    name: 'Links',
    description: 'These services are link type',
    public: true,
  },
};
export async function up(knex) {
  await knex.schema.createTable('ServiceDefinition', function (table) {
    table.uuid('id', { primaryKey: true }).defaultTo(knex.fn.uuid());
    table.string('name');
    table.string('description');
    table.boolean('public').defaultTo(true);
  });

  await knex.schema.table('ServiceInstance', function (table) {
    table
      .uuid('service_definition_id')
      .references('id')
      .inTable('ServiceDefinition')
      .onDelete('CASCADE');
  });
  const serviceInstances = await knex('ServiceInstance').select();

  if (!serviceInstances) {
    return;
  }

  await knex.batchInsert(
    'ServiceDefinition',
    Object.values(SERVICE_DEFINITION)
  );

  await knex('ServiceInstance')
    .where('type', 'link')
    .update({ service_definition_id: link_serviceDef_id });

  await knex('ServiceInstance')
    .where('type', 'Intel')
    .update({ service_definition_id: vault_serviceDef_id });

  await knex.schema.table('ServiceInstance', function (table) {
    table.dropColumn('type');
    table.dropColumn('provider');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table('ServiceInstance', function (table) {
    table.string('type');
    table.string('service_definition_id');
    table.dropColumn('service_definition_id');
  });

  await knex.schema.dropTable('ServiceDefinition');
}
