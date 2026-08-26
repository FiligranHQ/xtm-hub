/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const targetServiceInstanceSlugs = [
    'opencti-custom-dashboards',
    'opencti-integrations',
    'openaev-scenarios',
    'opencti-playbooks',
    'xtm-platform-roadmap',
    'opencti-custom-views',
  ];

  await knex('Subscription')
    .whereNot('organization_id', 'ba091095-418f-4b4f-b150-6c9295e232c4')
    .whereIn(
      'service_instance_id',
      knex('ServiceInstance')
        .whereIn('slug', targetServiceInstanceSlugs)
        .select('id')
    )
    .delete();
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(_knex) {
  // Irreversible data migration: deleted rows cannot be restored.
}
