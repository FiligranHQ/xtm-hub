import { Resolvers } from '../../../__generated__/resolvers-types';
import { GrafanaApp } from './grafana.app';

const resolvers: Resolvers = {
  Query: {
    loadGrafanaToken: async () => {
      return GrafanaApp.generateGrafanaToken();
    },
  },
  Mutation: {},
};

export default resolvers;
