import {
  MutationAddCompetitorArgs,
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
        return CompetitorDomain.loadCompetitors(args);
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
  },
  Mutation: {
    addCompetitor: async (_, { input }: MutationAddCompetitorArgs) => {
      try {
        return CompetitorApp.insertCompetitor(input);
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },

    updateCompetitor: async (_, { input }) => {
      try {
        return CompetitorApp.updateCompetitorById(input);
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },

    deleteCompetitor: async (_, { id }) => {
      try {
        return CompetitorApp.deleteCompetitorById(id as CompetitorId);
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
  },
};

export default resolvers;
