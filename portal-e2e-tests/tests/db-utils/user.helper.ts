import { db } from './db-connection';
import { faker } from '@faker-js/faker';
import { ADMIN_PASSWORD_HASH, ADMIN_PASSWORD_SALT } from './const';

export const generateUser = async ({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}): Promise<{
  email: string;
}> => {
  const email = faker.internet.email();
  const userId = faker.string.uuid();
  const organizationId = faker.string.uuid();

  await db('Organization')
    .insert([
      {
        id: organizationId,
        name: email,
        personal_space: true,
      },
    ])
    .onConflict('id')
    .ignore();

  await db('User')
    .insert([
      {
        id: userId,
        email,
        salt: ADMIN_PASSWORD_SALT,
        password: ADMIN_PASSWORD_HASH,
        first_name: firstName,
        last_name: lastName,
        selected_organization_id: organizationId,
      },
    ])
    .onConflict('id')
    .ignore();

  await db('User_Organization')
    .insert([
      {
        user_id: userId,
        organization_id: organizationId,
      },
    ])
    .onConflict('id')
    .ignore();

  return {
    email,
  };
};

export const removeUser = async (email: string) => {
  await db('User').delete('*').where('email', '=', email);
};
