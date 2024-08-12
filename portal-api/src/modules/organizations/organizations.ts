import Organization from '../../model/kanel/public/Organization';
import { PortalContext } from '../../model/portal-context';
import { db } from '../../../knexfile';

export const loadOrganizationBy = async (
  context: PortalContext,
  field: string,
  value: string
): Promise<Organization> => {
  const organization = await db<Organization>(context, 'Organization')
    .where({ [field]: value })
    .select('*')
    .first();
  return organization;
};
