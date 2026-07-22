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
}
