import { Resolvers } from '../../../__generated__/resolvers-types';
import { EpicApp } from './epic.app';
import { mapEpicToGraphqlEpic } from './epic.helper';

const resolvers: Resolvers = {
  Query: {
    epics: async (_parent, opts, _context) => {
      return EpicApp.loadEpics(opts);
    },
  },
  Mutation: {
    createEpic: async (_, { input }) => {
      try {
        const createdEpic = await EpicApp.createEpic(input);
        return mapEpicToGraphqlEpic(createdEpic);
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.EpicCreateError);
      }
    },
    updateEpic: async (_, { id, input }) => {
      try {
        const updatedEpic = await EpicApp.updateEpic(
          extractId<EpicId>(id),
          input
        );
        return mapEpicToGraphqlEpic(updatedEpic);
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.EpicUpdateError);
      }
    },
    deleteEpic: async (_, { id }) => {
      try {
        const deletedEpic = await EpicApp.deleteEpic(extractId<EpicId>(id));
        return mapEpicToGraphqlEpic(deletedEpic);
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.EpicDeleteError);
      }
    },
  },
};
export default resolvers;
