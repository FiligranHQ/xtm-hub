import { Organization } from '../../__generated__/resolvers-types';
import { db } from '../../../knexfile';
import { PortalContext } from '../../model/portal-context';

export const loadOrganizationBy = async (context: PortalContext, field: string, value: string): Promise<Organization> => {
  return db<Organization>(context, 'Organization').where({ [field]: value }).select('*').first();
};
