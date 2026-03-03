import { Resolvers } from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import Epic, { EpicId } from '../../../model/kanel/public/Epic';
import { UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { extractId } from '../../../utils/utils';
import { DocumentDomain } from '../document/domain/document.domain';
import { EpicApp } from './epic.app';
import { mapToGraphQLEpic } from './epic.helper';

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
        const createdEpic = await EpicApp.createEpic(input, document);
        return mapToGraphQLEpic(createdEpic);
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
        return mapToGraphQLEpic(updatedEpic);
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.EpicUpdateError);
      }
    },
    deleteEpic: async (_, { id }) => {
      try {
        const deletedEpic = await EpicApp.deleteEpic(extractId<EpicId>(id));
        return mapToGraphQLEpic(deletedEpic);
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.EpicDeleteError);
      }
    },
  },
};
export default resolvers;
