/**
 * Migration: Refactor DeploymentRequest status field
 *
 * This migration replaces the single 'status' column with three new columns:
 * - hub_status: Status from Hub's perspective (queued, pending, active, expired, failed, canceled)
 * - target_state: Desired state of the platform (pending, provisioning, active, removing, removed, inactive, NULL)
 * - actual_state: Current actual state of the platform (pending, provisioning, active, removing, removed, inactive, NULL)
 * - ordering: For maintaining chronological order
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Step 1: Add new columns
  await knex.schema.alterTable('DeploymentRequest', (table) => {
    table.string('hub_status');
    table.string('target_state');
    table.string('actual_state');
    table.integer('ordering');
  });

  // Step 1.5: Rename product_service_instance_id to platform_id
  await knex.schema.alterTable('DeploymentRequest', (table) => {
    table.renameColumn('product_service_instance_id', 'platform_id');
  });

  // Step 2: Migrate existing data
  // Get all existing deployment requests ordered by request_date for ordering
  const existingRequests = await knex('DeploymentRequest')
    .select('id', 'status', 'request_date')
    .orderBy('request_date', 'asc');

  // Apply ordering based on chronological order
  for (let i = 0; i < existingRequests.length; i++) {
    const request = existingRequests[i];
    let hubStatus, targetState, actualState;

    // Map old status to new fields according to spec
    switch (request.status) {
      case 'QUEUED':
        hubStatus = 'queued';
        targetState = null;
        actualState = null;
        break;
      case 'PENDING':
        hubStatus = 'pending';
        targetState = 'active';
        actualState = null;
        break;
      case 'PROVISIONING':
        hubStatus = 'pending';
        targetState = 'active';
        actualState = 'provisioning';
        break;
      case 'ACTIVE':
        hubStatus = 'active';
        targetState = 'active';
        actualState = 'active';
        break;
      case 'EXPIRED':
        hubStatus = 'expired';
        targetState = 'inactive';
        actualState = null;
        break;
      case 'FAILED':
        hubStatus = 'failed';
        targetState = 'active';
        actualState = 'provisioning';
        break;
      case 'CANCELLED':
        hubStatus = 'canceled';
        targetState = 'active';
        actualState = null;
        break;
      default:
        // Fallback for any unexpected status
        hubStatus = 'pending';
        targetState = null;
        actualState = null;
    }

    await knex('DeploymentRequest')
      .where('id', request.id)
      .update({
        hub_status: hubStatus,
        target_state: targetState,
        actual_state: actualState,
        ordering: i + 1, // 1-based ordering
      });
  }

  // Step 3: Make hub_status non-nullable with default value
  await knex.schema.alterTable('DeploymentRequest', (table) => {
    table.string('hub_status').notNullable().defaultTo('pending').alter();
    table.integer('ordering').notNullable().defaultTo(0).alter();
  });

  // Step 4: Drop the old status column
  await knex.schema.alterTable('DeploymentRequest', (table) => {
    table.dropColumn('status');
  });
}

/**
 * Rollback migration: Restore original status column
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Step 1: Rename back platform_id to product_service_instance_id
  await knex.schema.alterTable('DeploymentRequest', (table) => {
    table.renameColumn('platform_id', 'product_service_instance_id');
  });

  // Step 2: Re-add the status column
  await knex.schema.alterTable('DeploymentRequest', (table) => {
    table.string('status');
  });

  // Step 3: Migrate data back from new columns to status
  const existingRequests = await knex('DeploymentRequest').select(
    'id',
    'hub_status',
    'target_state',
    'actual_state'
  );

  for (const request of existingRequests) {
    let status;

    // Reverse mapping: hub_status + target_state + actual_state → status
    if (request.hub_status === 'queued') {
      status = 'QUEUED';
    } else if (request.hub_status === 'pending') {
      if (request.actual_state === 'provisioning') {
        status = 'PROVISIONING';
      } else {
        status = 'PENDING';
      }
    } else if (request.hub_status === 'active') {
      status = 'ACTIVE';
    } else if (request.hub_status === 'expired') {
      status = 'EXPIRED';
    } else if (request.hub_status === 'failed') {
      status = 'FAILED';
    } else if (request.hub_status === 'canceled') {
      status = 'CANCELLED';
    } else {
      status = 'PENDING'; // Fallback
    }

    await knex('DeploymentRequest').where('id', request.id).update({ status });
  }

  // Step 4: Make status non-nullable
  await knex.schema.alterTable('DeploymentRequest', (table) => {
    table.string('status').notNullable().alter();
  });

  // Step 5: Drop the new columns
  await knex.schema.alterTable('DeploymentRequest', (table) => {
    table.dropColumn('hub_status');
    table.dropColumn('target_state');
    table.dropColumn('actual_state');
    table.dropColumn('ordering');
  });
}
