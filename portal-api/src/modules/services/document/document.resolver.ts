import { fromGlobalId } from 'graphql-relay/node/node.js';
import { Resolvers } from '../../../__generated__/resolvers-types';
import Document, { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceId } from '../../../model/kanel/public/Service';
import { UserId } from '../../../model/kanel/public/User';
import {
  deleteDocument,
  insertDocument,
  loadDocuments,
  sendFileToS3,
  updateDocument,
} from './document.domain';
import { checkDocumentExists, normalizeDocumentName } from './document.helper';

const resolvers: Resolvers = {
  Mutation: {
    addDocument: async (_, opt, context) => {
      try {
        const minioName = await sendFileToS3(
          opt.document.file,
          context.user.id
        );
        const data: Document = {
          uploader_id: context.user.id as UserId,
          description: opt.description,
          minio_name: minioName,
          file_name: normalizeDocumentName(opt.document.file.filename),
          service_id: 'e88e8f80-ba9e-480b-ab27-8613a1565eff' as ServiceId,
          created_at: new Date(),
        } as unknown as Document;
        const [addedDocument] = await insertDocument(data);
        return addedDocument;
      } catch (error) {
        console.error('Error while inserting document:', error);
        throw error;
      }
    },
    editDocument: async (_, { documentId, newDescription }, context) => {
      try {
        const [document] = await updateDocument(
          context,
          { description: newDescription },
          fromGlobalId(documentId).id as DocumentId
        );
        return document;
      } catch (error) {
        console.error('Error while updating document:', error);
        throw error;
      }
    },
    deleteDocument: async (_, { documentId }, context) => {
      try {
        const deletedDocument = await deleteDocument(
          context,
          fromGlobalId(documentId).id as DocumentId
        );
        return deletedDocument;
      } catch (error) {
        console.error('Error while deleting document:', error);
        throw error;
      }
    },
  },
  Query: {
    documentExists: async (_, input) => {
      try {
        return checkDocumentExists(input.documentName ?? '');
      } catch (error) {
        console.error('Error while fetching files:', error);
        throw error;
      }
    },
    documents: async (
      _,
      { first, after, orderMode, orderBy, filter },
      context
    ) => {
      return loadDocuments(
        context,
        { first, after, orderMode, orderBy },
        filter
      );
    },
  },
};

export default resolvers;
