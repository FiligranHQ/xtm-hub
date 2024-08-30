import Organization from '../../model/kanel/public/Organization';
import { PortalContext } from '../../model/portal-context';
import { db, dbUnsecure } from '../../../knexfile';
import { extractDomain } from '../../utils/verify-email.util';

export const loadOrganizationBy = async (
  context: PortalContext,
  field: string,
  value: string
): Promise<Organization> => {
  return db<Organization>(context, 'Organization')
    .where({ [field]: value })
    .select('*')
    .first();
};

export const loadUnsecureOrganizationBy = async (
  field: string,
  value: string
): Promise<Organization> => {
  return dbUnsecure<Organization>('Organization')
    .where({ [field]: value })
    .select('*')
    .first();
};

export const loadOrganizationsFromEmail = async (
  email: string
): Promise<Organization[]> => {
  const extractedDomain = extractDomain(email);
  return dbUnsecure<Organization[]>('Organization')
    .whereRaw('? = ANY("domains")', [extractedDomain])
    .select('*');
};
