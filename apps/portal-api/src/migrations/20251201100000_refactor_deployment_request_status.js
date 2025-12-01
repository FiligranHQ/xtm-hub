/**
 * Migration: Refactor DeploymentRequest status field
 *
 * This migration replaces the single 'status' column with three new columns:
 * - hub_status: Status from Hub's perspective (pending, approved, denied, cancelled)
 * - target_state: Desired state of the platform (pending, started, stopped)
 * - actual_state: Current actual state of the platform (pending, started, stopped)
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
      case 'PENDING':
        hubStatus = 'pending';
        targetState = 'pending';
        actualState = 'pending';
        break;
      case 'QUEUED':
        hubStatus = 'approved';
        targetState = 'pending';
        actualState = 'pending';
        break;
      case 'PROVISIONING':
        hubStatus = 'approved';
        targetState = 'started';
        actualState = 'pending';
        break;
      case 'ACTIVE':
        hubStatus = 'approved';
        targetState = 'started';
        actualState = 'started';
        break;
      case 'EXPIRED':
        hubStatus = 'approved';
        targetState = 'stopped';
        actualState = 'stopped';
        break;
      case 'FAILED':
        hubStatus = 'approved';
        targetState = 'started';
        actualState = 'pending';
        // failure_reason should already exist in the table
        break;
      case 'CANCELLED':
        hubStatus = 'cancelled';
        targetState = 'pending';
        actualState = 'pending';
        break;
      default:
        // Fallback for any unexpected status
        hubStatus = 'pending';
        targetState = 'pending';
        actualState = 'pending';
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

  // Step 3: Make new columns non-nullable with default values
  await knex.schema.alterTable('DeploymentRequest', (table) => {
    table.string('hub_status').notNullable().defaultTo('pending').alter();
    table.string('target_state').notNullable().defaultTo('pending').alter();
    table.string('actual_state').notNullable().defaultTo('pending').alter();
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
  // Step 1: Re-add the status column
  await knex.schema.alterTable('DeploymentRequest', (table) => {
    table.string('status');
  });

  // Step 2: Migrate data back from new columns to status
  const existingRequests = await knex('DeploymentRequest')
    .select('id', 'hub_status', 'target_state', 'actual_state', 'failure_reason');

  for (const request of existingRequests) {
    let status;

    // Reverse mapping: hub_status + target_state + actual_state → status
    if (request.hub_status === 'pending') {
      status = 'PENDING';
    } else if (request.hub_status === 'cancelled') {
      status = 'CANCELLED';
    } else if (request.hub_status === 'denied') {
      status = 'CANCELLED'; // Map denied to CANCELLED as there's no DENIED in old enum
    } else if (request.hub_status === 'approved') {
      if (request.actual_state === 'started') {
        status = 'ACTIVE';
      } else if (request.actual_state === 'stopped') {
        status = 'EXPIRED';
      } else if (request.target_state === 'pending') {
        status = 'QUEUED';
      } else if (request.target_state === 'started' && request.failure_reason) {
        status = 'FAILED';
      } else if (request.target_state === 'started') {
        status = 'PROVISIONING';
      } else {
        status = 'PENDING'; // Fallback
      }
    } else {
      status = 'PENDING'; // Fallback
    }

    await knex('DeploymentRequest')
      .where('id', request.id)
      .update({ status });
  }

  // Step 3: Make status non-nullable
  await knex.schema.alterTable('DeploymentRequest', (table) => {
    table.string('status').notNullable().alter();
  });

  // Step 4: Drop the new columns
  await knex.schema.alterTable('DeploymentRequest', (table) => {
    table.dropColumn('hub_status');
    table.dropColumn('target_state');
    table.dropColumn('actual_state');
    table.dropColumn('ordering');
  });
}
