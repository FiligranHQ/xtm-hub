/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('UserService_Capability', function (table) {
    table.uuid('id', { primaryKey: true }).defaultTo(knex.fn.uuid());
    table
      .uuid('user_service_id')
      .references('id')
      .inTable('User_Service')
      .onDelete('CASCADE');
    table
      .uuid('generic_service_capability_id')
      .references('id')
      .inTable('Generic_Service_Capability')
      .onDelete('CASCADE')
      .nullable();
  });

  const genericServiceCapabilities = await knex(
    'Generic_Service_Capability'
  ).select();

  await knex.schema.table('Generic_Service_Capability', function (table) {
    table.dropColumn('user_service_id');
    table.dropColumn('service_capability_name');
    table.string('name');
  });
  await knex('Generic_Service_Capability').delete('*');

  await knex('Generic_Service_Capability').insert([
    {
      id: '84025997-a8ce-4406-8048-49c806136716',
      name: 'BYPASS_SERVICE',
    },
    {
      id: '3d42ae4e-f727-4809-8aaf-b44fc0679291',
      name: 'MANAGE_SUBSCRIPTION',
    },
    {
      id: 'b3275212-6c80-42de-8508-b7b71d5926fc',
      name: 'MANAGE_ACCESS',
    },
    {
      id: 'cfa2f967-48ae-4057-b079-93daa4c22f2d',
      name: 'ACCESS',
    },
  ]);

  const capabilityIdMapping = {
    ADMIN_SUBSCRIPTION: '3d42ae4e-f727-4809-8aaf-b44fc0679291',
    MANAGE_ACCESS: 'b3275212-6c80-42de-8508-b7b71d5926fc',
    ACCESS_SERVICE: 'cfa2f967-48ae-4057-b079-93daa4c22f2d',
  };
  for (const genericServiceCapability of genericServiceCapabilities) {
    await knex('UserService_Capability').insert({
      id: knex.fn.uuid(),
      user_service_id: genericServiceCapability.user_service_id,
      generic_service_capability_id:
        capabilityIdMapping[genericServiceCapability.service_capability_name],
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table('Generic_Service_Capability', function (table) {
    table
      .uuid('user_service_id')
      .references('id')
      .inTable('User_Service')
      .onDelete('CASCADE');
    table.renameColumn('name', 'service_capability_name');
  });

  await knex.schema.dropTable('UserService_Capability');
}
