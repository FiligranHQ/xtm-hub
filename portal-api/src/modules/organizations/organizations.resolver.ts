import {
  Organization,
  OrganizationConnection,
  Resolvers,
} from '../../__generated__/resolvers-types';
import { db, paginate } from '../../../knexfile';
import { v4 as uuidv4 } from 'uuid';
import { loadOrganizationBy } from './organizations.domain';
import { extractId } from '../../utils/utils';

const resolvers: Resolvers = {
  Query: {
    organization: async (_, { id }, context) =>
      loadOrganizationBy(context, 'Organization.id', extractId(id)),
    organizations: async (_, { first, after, orderMode, orderBy }, context) => {
      return paginate<Organization>(context, 'Organization', {
        first,
        after,
        orderMode,
        orderBy,
      })
        .select('*')
        .asConnection<OrganizationConnection>();
    },
  },
  Mutation: {
    addOrganization: async (_, { name }, context) => {
      const data = { id: uuidv4(), name };
      const [addOrganization] = await db<Organization>(context, 'Organization')
        .insert(data)
        .returning('*');
      return addOrganization;
    },
  },
};

export default resolvers;
