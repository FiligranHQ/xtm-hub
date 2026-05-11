/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Get current vault service definition
  const [vaultServiceDef] = await knex('ServiceDefinition')
    .where({ description: 'Vault services to share information' })
    .select('*');

  if (vaultServiceDef.id !== '918033d7-62fa-4734-842b-a9c4e6c50396') {
    // Insert new vault service definition with given id
    await knex('ServiceDefinition')
      .where({ description: 'Vault services to share information' })
      .insert({
        id: '918033d7-62fa-4734-842b-a9c4e6c50396',
        name: vaultServiceDef.name,
        description: vaultServiceDef.description,
        public: vaultServiceDef.public,
        identifier: vaultServiceDef.identifier,
      });

    // Adapt all service instance& service_price & service_capa with this new id

    await knex('ServiceInstance')
      .where({ service_definition_id: vaultServiceDef.id })
      .update({
        service_definition_id: '918033d7-62fa-4734-842b-a9c4e6c50396',
      });
    await knex('Service_Price')
      .where({ service_definition_id: vaultServiceDef.id })
      .update({
        service_definition_id: '918033d7-62fa-4734-842b-a9c4e6c50396',
      });
    await knex('Service_Capability')
      .where({ service_definition_id: vaultServiceDef.id })
      .update({
        service_definition_id: '918033d7-62fa-4734-842b-a9c4e6c50396',
      });

    // Delete the old service definition
    await knex('ServiceDefinition')
      .where({
        description: 'Vault services to share information',
      })
      .whereNot('id', '918033d7-62fa-4734-842b-a9c4e6c50396')
      .delete('*');
  }

  // Get current custom dashboard service definition
  const [customServiceDef] = await knex('ServiceDefinition')
    .where({ name: 'OpenCTI Custom Dashboards Library' })
    .select('*');

  if (customServiceDef.id !== '36324c9c-b8b3-48ec-9db4-d187b2f310b0') {
    // Insert new custom dashboard service definition with given id
    await knex('ServiceDefinition')
      .where({ name: 'OpenCTI Custom Dashboards Library' })
      .insert({
        id: '36324c9c-b8b3-48ec-9db4-d187b2f310b0',
        name: customServiceDef.name,
        description: customServiceDef.description,
        public: customServiceDef.public,
        identifier: customServiceDef.identifier,
      });

    // Adapt all existing service instance & service_price & service_capa with new service_definition_id

    await knex('ServiceInstance')
      .where({ service_definition_id: customServiceDef.id })
      .update({
        service_definition_id: '36324c9c-b8b3-48ec-9db4-d187b2f310b0',
      });

    await knex('Service_Price')
      .where({ service_definition_id: customServiceDef.id })
      .update({
        service_definition_id: '36324c9c-b8b3-48ec-9db4-d187b2f310b0',
      });
    await knex('Service_Capability')
      .where({ service_definition_id: customServiceDef.id })
      .update({
        service_definition_id: '36324c9c-b8b3-48ec-9db4-d187b2f310b0',
      });

    // Delete old service definition
    await knex('ServiceDefinition')
      .where({
        name: 'OpenCTI Custom Dashboards Library',
      })
      .whereNot('id', '36324c9c-b8b3-48ec-9db4-d187b2f310b0')
      .delete('*');
  }
  // Insert all service_capa for all subscription that already exists
  const vaultServiceInstances = await knex('ServiceInstance')
    .where({ service_definition_id: '918033d7-62fa-4734-842b-a9c4e6c50396' })
    .select('*');
  for (const vaultService of vaultServiceInstances) {
    const subscriptionOnVault = await knex('Subscription')
      .where({
        service_instance_id: vaultService.id,
      })
      .select('*');
    const serviceCapaOnVault = await knex('Service_Capability')
      .where({ service_definition_id: '918033d7-62fa-4734-842b-a9c4e6c50396' })
      .select('*');
    for (const capa of serviceCapaOnVault) {
      await knex('Subscription_Capability').insert({
        id: knex.fn.uuid(),
        service_capability_id: capa.id,
        subscription_id: subscriptionOnVault.id,
      });
    }
  }

  const customDashboardServiceInstances = await knex('ServiceInstance')
    .where({ service_definition_id: '36324c9c-b8b3-48ec-9db4-d187b2f310b0' })
    .select('*');
  for (const customDashboardServiceInstance of customDashboardServiceInstances) {
    const subscriptionOnCustomDashboard = await knex('Subscription')
      .where({
        service_instance_id: customDashboardServiceInstance.id,
      })
      .select('*');
    const serviceCapaOnCustomDashboard = await knex('Service_Capability')
      .where({ service_definition_id: '36324c9c-b8b3-48ec-9db4-d187b2f310b0' })
      .select('*');
    for (const capa of serviceCapaOnCustomDashboard) {
      await knex('Subscription_Capability').insert({
        id: knex.fn.uuid(),
        service_capability_id: capa.id,
        subscription_id: subscriptionOnCustomDashboard.id,
      });
    }
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down() {}
