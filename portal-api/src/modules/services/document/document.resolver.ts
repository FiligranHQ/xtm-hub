import { fromGlobalId } from 'graphql-relay/node/node.js';
import { Resolvers } from '../../../__generated__/resolvers-types';
import {
  DocumentId,
  DocumentMutator,
} from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { UserId } from '../../../model/kanel/public/User';
import { logApp } from '../../../utils/app-logger.util';
import { UnknownError } from '../../../utils/error.util';
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
    addDocument: async (_, payload, context) => {
      try {
        const minioName = await sendFileToS3(
          payload.document.file,
          context.user.id,
          context.serviceInstanceId as ServiceInstanceId
        );
        const data: DocumentMutator = {
          uploader_id: context.user.id as UserId,
          description: payload.description,
          minio_name: minioName,
          file_name: normalizeDocumentName(payload.document.file.filename),
          service_instance_id: context.serviceInstanceId as ServiceInstanceId,
          created_at: new Date(),
          mime_type: payload.document.file.mimetype,
          parent_document_id: payload.parentDocumentId as DocumentId,
          active: payload.active ?? true,
        };
        const [addedDocument] = await insertDocument(data);
        return addedDocument;
      } catch (error) {
        throw UnknownError('INSERT_DOCUMENT_ERROR', { detail: error });
      }
    },
    editDocument: async (_, { documentId, newDescription }, context) => {
      try {
        const [document] = await updateDocumentDescription(
          context,
          { description: newDescription },
          fromGlobalId(documentId).id as DocumentId,
          context.serviceInstanceId as ServiceInstanceId
        );
        return document;
      } catch (error) {
        throw UnknownError('UPDATE_DOCUMENT_ERROR', { detail: error });
      }
    },
    deleteDocument: async (_, { documentId }, context) => {
      try {
        return deleteDocument(
          context,
          fromGlobalId(documentId).id as DocumentId,
          context.serviceInstanceId as ServiceInstanceId
        );
      } catch (error) {
        throw UnknownError('DELETE_DOCUMENT_ERROR', { detail: error });
      }
    },
  },
  Query: {
    documentExists: async (_, input) => {
      try {
        return checkDocumentExists(
          input.documentName ?? '',
          fromGlobalId(input.serviceInstanceId).id as ServiceInstanceId
        );
      } catch (error) {
        logApp.error('Error while fetching documents:', error);
        throw error;
      }
    },
    documents: async (
      _,
      { first, after, orderMode, orderBy, filter, serviceInstanceId },
      context
    ) => {
      try {
        return getDocuments(
          context,
          { first, after, orderMode, orderBy },
          normalizeDocumentName(filter ?? ''),
          fromGlobalId(serviceInstanceId).id as ServiceInstanceId
        );
      } catch (error) {
        logApp.error('Error while fetching documents:', error);
        throw error;
      }
    },
  },
};

export default resolvers;
