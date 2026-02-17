import { createUser } from '../../tests/test-utils.ts';

export async function seed(knex) {
  const pending_users = [
    {
      email: 'Tyrion.Lannister@filigran.io',
      last_name: 'Tyrion',
      first_name: 'Lannister',
    },
    {
      email: 'Arya.Stark@filigran.io',
      last_name: 'Arya',
      first_name: 'Stark',
    },
    {
      email: 'Sandor.Clegane@filigran.io',
      last_name: 'Sandor',
      first_name: 'Clegane',
    },
    {
      email: 'Brienne.Tarth@filigran.io',
      last_name: 'Brienne',
      first_name: 'Tarth',
    },
  ];

  for (const user of pending_users) {
    await createUser({
      knex,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      pending: true,
    });
  }
}
