import { Resolvers } from '../../../__generated__/resolvers-types';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import { UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { StillReferencedError } from '../../../utils/error/error.util';
import { organizationsApp } from './organizations.app';
import {
  loadOrganizationBy,
  loadOrganizations,
  loadOrganizationsByUser,
} from './organizations.domain';

const resolvers: Resolvers = {
  Query: {
    organization: async (_, { id }) =>
      loadOrganizationBy({ id: id as OrganizationId }),
    organizations: async (_, opts) => {
      return loadOrganizations(opts);
    },
    userOrganizations: async (_, __, context) => {
      return loadOrganizationsByUser(context.user.id);
    },
  },
  Mutation: {
    addOrganization: async (_, { input }) => {
      try {
        return await organizationsApp.createOrganization(input);
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.AddOrganizationError);
      }
    },
    editOrganization: async (_, { id, input }) => {
      try {
        return await organizationsApp.updateOrganization(
          id as OrganizationId,
          input
        );
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.EditOrganizationError);
      }
    },
    deleteOrganization: async (_, { id }) => {
      try {
        return await organizationsApp.deleteOrganization(id as OrganizationId);
      } catch (error) {
        if (error.message.contains('STILL_IN_ORGANIZATION')) {
          throw StillReferencedError(error.message);
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
