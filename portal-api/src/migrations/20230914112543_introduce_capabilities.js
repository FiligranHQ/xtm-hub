export async function up(knex) {

  // Create table Portal Capability
  await knex.schema.createTable('CapabilityPortal', (table) => {
    table.uuid('id', { primaryKey: true });
    table.string('name');
    table.unique('name');
  });

  // Create table Portal Role
  await knex.schema.createTable('RolePortal', (table) => {
    table.uuid('id', { primaryKey: true });
    table.string('name');
    table.unique('name');
  });

  // Create many to many table RolePortal to CapabilityPortal
  await knex.schema.createTable('RolePortal_CapabilityPortal', function(table) {
    table.increments('id').primary();
    table.uuid('capability_portal_id').references('id').inTable('CapabilityPortal').onDelete('CASCADE');
    table.uuid('role_portal_id').references('id').inTable('RolePortal').onDelete('CASCADE');
  });

  // Create many to many table User to RolePortal
  await knex.schema.createTable('User_RolePortal', function(table) {
    table.increments('id').primary();
    table.uuid('user_id').references('id').inTable('User').onDelete('CASCADE');
    table.uuid('role_portal_id').references('id').inTable('RolePortal').onDelete('CASCADE');
  });
}

export async function down(knex) {
  await knex.schema.dropTable('RolePortal_CapabilityPortal');
  await knex.schema.dropTable('RolePortal');
  await knex.schema.dropTable('CapabilityPortal');
}
