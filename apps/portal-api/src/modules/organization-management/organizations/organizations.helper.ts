import { db } from '../../../../knexfile';
import Organization from '../../../model/kanel/public/Organization';
import { extractDomain } from '../../../utils/verify-email.util';

export const loadOrganizationsFromEmail = async (
  email: string
): Promise<Organization[]> => {
  const extractedDomain = extractDomain(email);
  return hasDomainOverlap([extractedDomain]);
};

export const hasDomainOverlap = async (
  domains: string[]
): Promise<Organization[]> => {
  return db<Organization[]>('Organization')
    .where(function () {
      domains.forEach((domain) => {
        this.orWhereRaw('? = ANY("domains")', [domain]);
      });
    })
    .select('*');
};
