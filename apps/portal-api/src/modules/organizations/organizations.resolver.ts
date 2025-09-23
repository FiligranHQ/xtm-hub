import { Resolvers } from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { dispatch } from '../../pub';
import { UnknownErrorCode } from '../../utils/error/error.code';
import { mapToGraphQLError } from '../../utils/error/error.mapping';
import { StillReferencedError } from '../../utils/error/error.util';
import { organizationsApp } from './organizations.app';
import {
  loadOrganizationBy,
  loadOrganizations,
  loadOrganizationsByUser,
} from './organizations.domain';
import { deleteOrganizationBy } from './organizations.helper';

const resolvers: Resolvers = {
  Query: {
    organization: async (_, { id }) =>
      loadOrganizationBy({ id: id as OrganizationId }),
    organizations: async (_, opts, context) => {
      return loadOrganizations(context, opts);
    },
    userOrganizations: async (_, __, context) => {
      return loadOrganizationsByUser(context, context.user.id);
    },
  },
  Mutation: {
    addOrganization: async (_, { input }, context) => {
      // Check if an organization exists with the same name (case insensitive)
      try {
        return await organizationsApp.createOrganization(context, input);
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.AddOrganizationError);
      }
    },
    editOrganization: async (_, { id, input }, context) => {
      try {
        return await organizationsApp.updateOrganization(
          context,
          id as OrganizationId,
          input
        );
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.EditOrganizationError);
      }
    },
    deleteOrganization: async (_, { id }) => {
      try {
        const [deletedOrganization] = await deleteOrganizationBy({
          id: id as OrganizationId,
        });

        await dispatch('Organization', 'delete', deletedOrganization);
        return deletedOrganization;
      } catch (error) {
        const regexErrorName = /is still referenced from table "([^"]+)"/;
        const match =
          error.detail.match(regexErrorName) ||
          error.message.match(regexErrorName);
        if (match) {
          const tableName = match[1];
          throw StillReferencedError(
            `${tableName.toUpperCase()}_STILL_IN_ORGANIZATION`
          );
        }

        throw mapToGraphQLError(
          error,
          UnknownErrorCode.DeleteOrganizationError
        );
      }
    },
  },
};

export default resolvers;
