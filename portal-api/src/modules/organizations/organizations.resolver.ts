import {
  Organization,
  OrganizationConnection,
  Resolvers,
} from '../../__generated__/resolvers-types';
import { DatabaseType, db, paginate } from '../../../knexfile';
import { v4 as uuidv4 } from 'uuid';
import { loadOrganizationBy } from './organizations.domain';
import { extractId } from '../../utils/utils';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import { dispatch } from '../../pub';

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
    deleteOrganization: async (_, { id }, context) => {
      const { id: databaseId } = fromGlobalId(id) as {
        type: DatabaseType;
        id: string;
      };

      const [deletedOrganization] = await db<Organization>(
        context,
        'Organization'
      )
        .where({ id: databaseId })
        .delete('*');
      await dispatch('Organization', 'delete', deletedOrganization);
      return deletedOrganization;
    },
  },
};

export default resolvers;
