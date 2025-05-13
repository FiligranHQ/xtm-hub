import { db } from './db-connection';
import crypto from 'node:crypto';
import { faker } from '@faker-js/faker';

export const generateUser = async (): Promise<{
  email: string;
  password: string;
}> => {
  const email = faker.internet.email();
  const password = faker.internet.password();
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, `sha512`)
    .toString(`hex`);

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
        salt,
        password: hash,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
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
    password,
  };
};

export const removeUser = async (email: string) => {
  await db('User').delete('*').where('email', '=', email);
};
