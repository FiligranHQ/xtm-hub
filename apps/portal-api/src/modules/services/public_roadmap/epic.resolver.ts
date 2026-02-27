import { Resolvers } from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import Epic, { EpicId } from '../../../model/kanel/public/Epic';
import { UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { extractId } from '../../../utils/utils';
import { DocumentDomain } from '../document/domain/document.domain';
import { EpicApp } from './epic.app';

const resolvers: Resolvers = {
  Epic: {
    document: async (epic: Epic, _) => {
      if (!epic.document_id) return null;
      const document = await DocumentDomain.loadDocumentBy({
        id: epic.document_id as DocumentId,
      });
      return document[0] ?? null;
    },
  },
  Query: {
    epics: async (_parent, opts, _context) => {
      return EpicApp.loadEpics(opts);
    },
  },
  Mutation: {
    createEpic: async (_, { input, document }) => {
      try {
        return await EpicApp.createEpic(input, document);
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
