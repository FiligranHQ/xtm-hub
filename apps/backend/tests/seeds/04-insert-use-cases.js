export async function seed(knex) {
  await knex('UseCase')
    .insert([
      {
        id: '64aed898-bf64-4872-b83c-b7b720d2edb7',
        name: 'Global',
        color: '#f5a623',
        product: ['opencti', 'openaev'],
      },
    ])
    .onConflict('id')
    .merge(['product']);
  await knex('SolutionCategory')
    .insert([
      {
        id: '8d121337-1a45-4b8b-ba73-f4e879c2e16a',
        name: 'SolutionCategory',
        product: ['opencti'],
      },
    ])
    .onConflict('id')
    .merge(['product']);
}
