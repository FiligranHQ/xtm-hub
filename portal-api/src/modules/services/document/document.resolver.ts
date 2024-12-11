import { fromGlobalId } from 'graphql-relay/node/node.js';
import { Resolvers } from '../../../__generated__/resolvers-types';
import Document, { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceId } from '../../../model/kanel/public/Service';
import { UserId } from '../../../model/kanel/public/User';
import { logApp } from '../../../utils/app-logger.util';
import {
  deleteDocument,
  getDocuments,
  insertDocument,
  sendFileToS3,
  updateDocumentDescription,
} from './document.domain';
import { checkDocumentExists, normalizeDocumentName } from './document.helper';

const resolvers: Resolvers = {
  Mutation: {
    addDocument: async (_, opt, context) => {
      try {
        const minioName = await sendFileToS3(
          opt.document.file,
          context.user.id,
          context.serviceId as ServiceId
        );
        const data: Document = {
          uploader_id: context.user.id as UserId,
          description: opt.description,
          minio_name: minioName,
          file_name: normalizeDocumentName(opt.document.file.filename),
          service_id: context.serviceId,
          created_at: new Date(),
        } as unknown as Document;
        const [addedDocument] = await insertDocument(data);
        return addedDocument;
      } catch (error) {
        logApp.error('Error while inserting document:', error);
        throw error;
      }
    },
    editDocument: async (_, { documentId, newDescription }, context) => {
      try {
        const [document] = await updateDocumentDescription(
          context,
          { description: newDescription },
          fromGlobalId(documentId).id as DocumentId,
          context.serviceId as ServiceId
        );
        return document;
      } catch (error) {
        logApp.error('Error while updating document:', error);
        throw error;
      }
    },
    deleteDocument: async (_, { documentId }, context) => {
      try {
        return deleteDocument(
          context,
          fromGlobalId(documentId).id as DocumentId,
          context.serviceId as ServiceId
        );
      } catch (error) {
        logApp.error('Error while deleting document:', error);
        throw error;
      }
    },
  },
  Query: {
    documentExists: async (_, input) => {
      try {
        return checkDocumentExists(
          input.documentName ?? '',
          fromGlobalId(input.serviceId).id as ServiceId
        );
      } catch (error) {
        logApp.error('Error while fetching documents:', error);
        throw error;
      }
    },
    documents: async (
      _,
      { first, after, orderMode, orderBy, filter, serviceId },
      context
    ) => {
      try {
        return getDocuments(
          context,
          { first, after, orderMode, orderBy },
          normalizeDocumentName(filter ?? ''),
          fromGlobalId(serviceId).id as ServiceId
        );
      } catch (error) {
        logApp.error('Error while fetching documents:', error);
        throw error;
      }
    },
  },
};

export default resolvers;
