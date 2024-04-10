import { dbUnsecure } from '../../../knexfile';
import Organization from '../../model/kanel/public/Organization';

export const loadOrganizationBy = async (field: string, value: string): Promise<Organization> => {
  return dbUnsecure<Organization>('Organization').where({ [field]: value }).select('*').first();
};
