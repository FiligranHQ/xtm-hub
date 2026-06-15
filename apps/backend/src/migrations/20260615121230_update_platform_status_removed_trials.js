/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex('PlatformConfiguration as pc')
    .update({ status: 'inactive' })
    .where('pc.status', '=', 'active')
    .whereExists(function () {
      this.select(1)
        .from('DeploymentRequest as dr')
        .whereRaw('dr.service_instance_id = pc.service_instance_id')
        .where('dr.type', '=', 'trial')
        .where('dr.actual_state', '=', 'removed');
    });
}

/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('PlatformConfiguration as pc')
    .update({ status: 'active' })
    .where('pc.status', '=', 'inactive')
    .whereExists(function () {
      this.select(1)
        .from('DeploymentRequest as dr')
        .whereRaw('dr.service_instance_id = pc.service_instance_id')
        .where('dr.type', '=', 'trial')
        .where('dr.actual_state', '=', 'removed');
    });
}
