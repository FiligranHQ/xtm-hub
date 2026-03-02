import {
  MutationCreateCompetitorArgs,
  QueryCompetitorsArgs,
  Resolvers,
} from '../../../__generated__/resolvers-types';

import { CompetitorId } from '../../../model/kanel/public/Competitor';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { CompetitorApp } from './competitor.app';
import { CompetitorDomain } from './competitor.domain';

const resolvers: Resolvers = {
  Query: {
    competitors: async (_, args: QueryCompetitorsArgs) => {
      try {
        return await CompetitorDomain.loadCompetitors(args);
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
  },
  Mutation: {
    createCompetitor: async (_, { input }: MutationCreateCompetitorArgs) => {
      try {
        return await CompetitorApp.insertCompetitor(input);
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },

    updateCompetitor: async (_, { input }) => {
      try {
        return await CompetitorApp.updateCompetitorById(input);
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },

    deleteCompetitor: async (_, { id }) => {
      try {
        return await CompetitorApp.deleteCompetitorById(id as CompetitorId);
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
  },
};

export default resolvers;
