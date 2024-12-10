import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../knexfile';
import { Organization, Resolvers } from '../../__generated__/resolvers-types';
import { dispatch } from '../../pub';
import { logApp } from '../../utils/app-logger.util';
import { loadOrganizationBy, loadOrganizations } from './organizations.domain';

const resolvers: Resolvers = {
  Query: {
    organization: async (_, { id }, context) =>
      loadOrganizationBy(context, 'Organization.id', id),
    organizations: async (_, { first, after, orderMode, orderBy }, context) => {
      return loadOrganizations(context, { first, after, orderMode, orderBy });
    },
  },
  Mutation: {
    addOrganization: async (_, { input }, context) => {
      const data = { id: uuidv4(), ...input };
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
          .update({ ...input })
          .returning('*');
        return updatedOrganization;
      } catch (error) {
        logApp.error('ERROR', error);
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
