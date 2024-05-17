import {Resolvers} from '../../__generated__/resolvers-types';
import {db} from '../../../knexfile';
import { extractId } from '../../utils/utils';
import RolePortal from "../../model/kanel/public/RolePortal";
import {loadRolePortalBy} from "./role-portal.domain";

const resolvers: Resolvers = {
    Query: {
        rolePortal: async (_, { id }, context) => loadRolePortalBy(context, 'RolePortal.id', extractId(id)),
        rolesPortal: async (_,__, context) => {
            return await db<RolePortal[]>(context, 'RolePortal')
                .select('*');
        },
    }
}
export default resolvers;