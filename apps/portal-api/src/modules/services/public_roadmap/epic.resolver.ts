import { Resolvers } from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import { EpicId } from '../../../model/kanel/public/Epic';
import { UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { extractId } from '../../../utils/utils';
import { DocumentApp } from '../document/document.app';
import { EpicApp } from './epic.app';

const resolvers: Resolvers = {
  Epic: {
    document: async (epic, _) =>
      DocumentApp.loadDocument(
        extractId<DocumentId>(epic.document.id as DocumentId)
      ),
  },
  Query: {
    epics: async (_parent, _args, _context) => {
      return EpicApp.loadEpics();
    },
  },
  Mutation: {
    createEpic: async (_, { input }) => {
      try {
        return await EpicApp.createEpic(input);
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.EpicCreateError);
      }
    },
    updateEpic: async (_, { id, input }) => {
      try {
        return await EpicApp.updateEpic(extractId<EpicId>(id), input);
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.EpicUpdateError);
      }
    },
    deleteEpic: async (_, { id }) => {
      try {
        return EpicApp.deleteEpic(extractId<EpicId>(id));
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.EpicDeleteError);
      }
    },
  },
};
export default resolvers;
