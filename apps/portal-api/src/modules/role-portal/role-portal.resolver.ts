import { db } from '../../../knexfile';
import { Resolvers } from '../../__generated__/resolvers-types';
import RolePortal from '../../model/kanel/public/RolePortal';
import { loadRolePortalBy } from './role-portal.domain';

const resolvers: Resolvers = {
  Query: {
    rolePortal: async (_, { id }) => loadRolePortalBy('RolePortal.id', id),
    rolesPortal: async (_, __) => {
      return await db<RolePortal[]>('RolePortal').select('*');
    },
  },
};
export default resolvers;
