/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex('Document')
    .update({ type: 'openaev_scenario' })
    .where('type', '=', 'openbas_scenarios');

  await knex('ServiceDefinition')
    .update({
      identifier: 'openaev_scenarios',
      name: 'OpenAEV Scenarios Library',
    })
    .where('identifier', '=', 'openbas_scenarios');
  await knex('ServiceInstance')
    .update({
      name: 'OpenAEV Demo',
      description:
        'Access a live OpenAEV demo instance and explore all of its features.',
      tags: '{openAEV}',
    })
    .where('name', '=', 'OpenBAS Demo');
  await knex('ServiceInstance')
    .update({
      name: 'OpenAEV Documentation',
      description:
        'Find all documents to get started with our Adversary Exposure Validation platform, also includes release notes and presentations.',
      tags: '{openAEV}',
    })
    .where('name', '=', 'OpenBAS Documentation');
  await knex('ServiceInstance')
    .update({
      name: 'OpenAEV Scenarios Library',
      description:
        'Explore a range of OpenAEV Scenarios shared by the Filigran team.',
      tags: '{openAEV}',
      slug: 'open-aev-scenarios',
    })
    .where('name', '=', 'OpenBAS Scenarios Library');
  await knex('ServiceInstance')
    .update({
      description:
        'Discover the latest articles about OpenCTI, OpenAEV and more.',
    })
    .where('name', '=', 'Filigran Blog');
  await knex('ServiceInstance')
    .update({
      description:
        'Master OpenCTI and OpenAEV with Filigran Academy—your ultimate guide to success across all skill levels!',
    })
    .where('name', '=', 'Filigran Academy');
}
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('Document')
    .update({ type: 'obas_scenario' })
    .where('type', '=', 'openaev_scenario');

  await knex('ServiceDefinition')
    .update({
      identifier: 'openbas_scenarios',
      name: 'OpenBAS Scenarios Library',
    })
    .where('identifier', '=', 'openaev_scenarios');
  await knex('ServiceInstance')
    .update({
      name: 'OpenBAS Demo',
      description:
        'Access a live OpenBAS demo instance and explore all of its features.',
      tags: '{openBAS}',
    })
    .where('name', '=', 'OpenAEV Demo');
  await knex('ServiceInstance')
    .update({
      name: 'OpenBAS Documentation',
      description:
        'Find all documents to get started with our Breach and Attack Simulation platform, also includes release notes and presentations.',
      tags: '{openBAS}',
    })
    .where('name', '=', 'OpenAEV Documentation');
  await knex('ServiceInstance')
    .update({
      name: 'OpenBAS Scenarios Library',
      description:
        'Explore a range of OpenBAS Scenarios shared by the Filigran team.',
      tags: '{openBAS}',
      slug: 'open-bas-scenarios',
    })
    .where('name', '=', 'OpenAEV Scenarios Library');
  await knex('ServiceInstance')
    .update({
      description:
        'Discover the latest articles about OpenCTI, OpenBAS and more.',
    })
    .where('name', '=', 'Filigran Blog');
  await knex('ServiceInstance')
    .update({
      description:
        'Master OpenCTI and OpenBAS with Filigran Academy—your ultimate guide to success across all skill levels!',
    })
    .where('name', '=', 'Filigran Academy');
}
