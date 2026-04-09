import { Resolvers } from '../../../__generated__/resolvers-types';
import { ServiceGroupId } from '../../../model/kanel/public/ServiceGroup';
import { UserId } from '../../../model/kanel/public/User';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { extractId } from '../../../utils/utils';
import { ServiceGroupApp } from './service-group.app';

const resolvers: Resolvers = {
  ServiceGroup: {
    users: ({ id }) => ServiceGroupApp.loadGroupUsers(id as ServiceGroupId),
  },
  Query: {
    serviceGroups: async (_, { serviceInstanceId }) => {
      try {
        return await ServiceGroupApp.loadGroups({
          serviceInstanceId,
        });
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
  },
  Mutation: {
    updateServiceGroups: async (_, { input }) => {
      try {
        const parsedInput = input.groups.map((group) => {
          return {
            id: extractId<ServiceGroupId>(group.id),
            userIds: group.userIds.map((userId) => extractId<UserId>(userId)),
          };
        });
        return await ServiceGroupApp.updateGroups(parsedInput);
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
  },
};

export default resolvers;
