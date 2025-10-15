import { Resolvers } from '../../../__generated__/resolvers-types';
import { DeploymentsApp } from './deployments.app';

const resolvers: Resolvers = {
  Mutation: {
    createDeploymentRequest: async (_, { input }) => {
      return await DeploymentsApp.createDeployment(input);
    },
  },
};

export default resolvers;
