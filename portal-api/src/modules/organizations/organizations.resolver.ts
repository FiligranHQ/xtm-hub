import {
  Organization,
  OrganizationConnection,
  Resolvers,
} from '../../__generated__/resolvers-types';
import { db, paginate } from '../../../knexfile';
import { v4 as uuidv4 } from 'uuid';
import { loadOrganizationBy, loadOrganizations } from './organizations.domain';
import { dispatch } from '../../pub';

const resolvers: Resolvers = {
  Query: {
    organization: async (_, { id }, context) =>
      loadOrganizationBy(context, 'Organization.id', id),
    organizations: async (_, { first, after, orderMode, orderBy }, context) => {
      return loadOrganizations(context, { first, after, orderMode, orderBy });
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
    editOrganization: async (_, { id, input }, context) => {
      try {
        const [updatedOrganization] = await db<Organization>(
          context,
          'Organization'
        )
          .where({ id })
          .update({ name: input.name })
          .returning('*');
        return updatedOrganization;
      } catch (error) {
        console.log('ERROR', error);
      }
    },
    deleteOrganization: async (_, { id }, context) => {
      const [deletedOrganization] = await db<Organization>(
        context,
        'Organization'
      )
        .where({ id })
        .delete('*');
      await dispatch('Organization', 'delete', deletedOrganization);
      return deletedOrganization;
    },
  },
};

export default resolvers;
