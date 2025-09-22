import { dbUnsecure } from '../../../knexfile';
import Organization from '../../model/kanel/public/Organization';
import { extractDomain } from '../../utils/verify-email.util';

export const loadOrganizationsFromEmail = async (
  email: string
): Promise<Organization[]> => {
  const extractedDomain = extractDomain(email);
  return dbUnsecure<Organization[]>('Organization')
    .whereRaw('? = ANY("domains")', [extractedDomain])
    .select('*');
};

export const deleteOrganizationByName = (name: string) => {
  return dbUnsecure<Organization>('Organization')
    .delete('*')
    .where('name', name);
};
