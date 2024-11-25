import { db } from './db-connection';
import { v4 as uuidv4 } from 'uuid';
export const removeOrganization = async (name: string) => {
  await db('Organization').delete('*').where('name', '=', name);
};

export const addOrganization = async (organizationName: string) => {
  const result = await db('Organization')
    .select('*')
    .where('name', '=', organizationName);

  if (result.length === 0) {
    const organization_data = {
      id: uuidv4(),
      name: organizationName,
    };
    await db('Organization').insert(organization_data);
  } else {
    console.log('Organization already exists', organizationName);
  }
};
