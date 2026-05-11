/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex('ServiceInstance').where({ name: 'Filigran Academy' }).update({
    creation_status: 'READY',
  });
  await knex('Service_Link').where({ name: 'Filigran Academy' }).update({
    url: 'https://academy.filigran.io/',
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('ServiceInstance').where({ name: 'Filigran Academy' }).update({
    creation_status: 'PENDING',
  });
  await knex('Service_Link').where({ name: 'Filigran Academy' }).update({
    url: '',
  });
}
