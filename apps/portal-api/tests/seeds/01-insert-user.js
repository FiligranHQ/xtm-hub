const REVENUE_SALES_UUID = '907f53cc-492f-4537-8702-e24b8ae515ca';
import { createUser } from '../test-utils.ts';

export async function seed(knex) {
  await createUser({
    knex,
    email: 'user15@test.fr',
    userId: 'e389e507-f1cd-4f2f-bfb2-274140d87d28',
    first_name: 'test',
    last_name: 'hello',
  });

  const { userId } = await createUser({
    knex,
    email: 'revenue_sales@filigran.io',
  });

  await knex('User_RolePortal').insert([
    {
      user_id: userId,
      role_portal_id: REVENUE_SALES_UUID,
    },
  ]);
}
