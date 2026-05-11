export async function up(knex) {
  await knex.schema.alterTable('User_Organization', (table) => {
    table.index('user_id', 'idx_user_organization_user_id');
    table.index('organization_id', 'idx_user_organization_organization_id');
  });

  await knex.schema.alterTable('UserOrganization_Capability', (table) => {
    table.index(
      'user_organization_id',
      'idx_userorganization_capability_user_organization_id'
    );
  });

  await knex.schema.alterTable('User_Organization_Pending', (table) => {
    table.index('user_id', 'idx_user_organization_pending_user_id');
    table.index(
      'organization_id',
      'idx_user_organization_pending_organization_id'
    );
  });
}

export async function down(knex) {
  await knex.schema.alterTable('User_Organization', (table) => {
    table.dropIndex('user_id', 'idx_user_organization_user_id');
    table.dropIndex('organization_id', 'idx_user_organization_organization_id');
  });

  await knex.schema.alterTable('UserOrganization_Capability', (table) => {
    table.dropIndex(
      'user_organization_id',
      'idx_userorganization_capability_user_organization_id'
    );
  });

  await knex.schema.alterTable('User_Organization_Pending', (table) => {
    table.dropIndex('user_id', 'idx_user_organization_pending_user_id');
    table.dropIndex(
      'organization_id',
      'idx_user_organization_pending_organization_id'
    );
  });
}
