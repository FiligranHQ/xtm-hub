import { Resolvers } from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import Epic, { EpicId } from '../../../model/kanel/public/Epic';
import { UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { DocumentDomain } from '../document/domain/document.domain';
import { EpicApp } from './epic.app';

const resolvers: Resolvers = {
  Epic: {
    document: async (epic, _) => {
      const { document_id } = epic as Epic;
      if (!document_id) return null;
      const document = await DocumentDomain.loadDocumentBy({
        id: document_id as DocumentId,
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
    updateEpic: async (_, { id, input, document }) => {
      try {
        return await EpicApp.updateEpic(id as EpicId, input, document);
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.EpicUpdateError);
      }
    },
    deleteEpic: async (_, { id }) => {
      try {
        return await EpicApp.deleteEpic(id as EpicId);
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.EpicDeleteError);
      }
    },
  },
};
export default resolvers;
