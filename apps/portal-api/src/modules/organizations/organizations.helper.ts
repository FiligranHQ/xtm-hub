import { Knex } from 'knex';
import { db, dbTx, dbUnsecure } from '../../../knexfile';
import Organization, {
  OrganizationInitializer,
  OrganizationMutator,
} from '../../model/kanel/public/Organization';
import { PortalContext } from '../../model/portal-context';
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

export const insertNewOrganization = (data: OrganizationInitializer) => {
  return dbUnsecure<Organization>('Organization').insert(data).returning('*');
};
export const deleteOrganizationByName = (name: string) => {
  return dbUnsecure<Organization>('Organization')
    .delete('*')
    .where('name', name);
};

export const updateOrganization = async (
  context: PortalContext,
  field: OrganizationMutator,
  input: OrganizationMutator,
  trx?: Knex.Transaction
) => {
  if (!trx) {
    trx = await dbTx();
  }
  const [updatedOrganization] = await db<Organization>(context, 'Organization')
    .where(field)
    .update(input)
    .returning('*')
    .transacting(trx)
    .secureQuery();

  return updatedOrganization;
};
