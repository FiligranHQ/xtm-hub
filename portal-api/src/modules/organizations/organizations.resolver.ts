import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../knexfile';
import { Organization, Resolvers } from '../../__generated__/resolvers-types';
import { dispatch } from '../../pub';
import { logApp } from '../../utils/app-logger.util';
import { StillReferencedError, UnknownError } from '../../utils/error.util';
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
        throw UnknownError('Error while editing the organization.');
      }
    },
    deleteOrganization: async (_, { id }, context) => {
      try {
        const [deletedOrganization] = await db<Organization>(
          context,
          'Organization'
        )
          .where({ id })
          .delete('*');
        await dispatch('Organization', 'delete', deletedOrganization);
        return deletedOrganization;
      } catch (error) {
        if (error.detail.includes('is still referenced from table "User"')) {
          throw StillReferencedError('USER_STILL_IN_ORGANIZATION');
          logApp.error(
            'Error while deleting the organization: at least one user still refers to this organization'
          );
        }
        if (
          error.message.includes(
            'is still referenced from table "Subscription"'
          )
        ) {
          throw StillReferencedError('SUBSCRIPTION_STILL_IN_ORGANIZATION');
          logApp.error(
            'Error while deleting the organization: at least one subscription still refers to this organization'
          );
        }
        logApp.error('Error while deleting the organization.', error);
        throw UnknownError('Error while deleting the organization.');
      }
    },
  },
};

export default resolvers;
