import { RolePortal} from '../../__generated__/resolvers-types';
import { db } from '../../../knexfile';
import { PortalContext } from '../../model/portal-context';

export const loadRolePortalBy = async (context: PortalContext, field: string, value: string): Promise<RolePortal> => {
    return db<RolePortal>(context, 'RolePortal').where({ [field]: value }).select('*');
};


