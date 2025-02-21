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
import { extractId } from '../../../utils/utils';
import {
  deleteDocument,
  getChildrenDocuments,
  getLabels,
  getUploader,
  loadDocumentBy,
  loadDocuments,
  sendFileToS3,
  updateDocumentDescription,
} from './document.domain';
import {
  checkDocumentExists,
  createDocument,
  normalizeDocumentName,
} from './document.helper';

const resolvers: Resolvers = {
  Mutation: {
    addDocument: async (_, payload, context) => {
      try {
        const file_name = normalizeDocumentName(payload.document.file.filename);
        const parent_document_id = payload.parentDocumentId
          ? (extractId(payload.parentDocumentId) as DocumentId)
          : null;
        const minioName = await sendFileToS3(
          payload.document.file,
          file_name,
          context.user.id,
          context.serviceInstanceId as ServiceInstanceId
        );

        const data: DocumentMutator & { labels?: string[] } = {
          uploader_id: context.user.id as UserId,
          name: payload.name,
          description: payload.description,
          short_description: payload.short_description,
          minio_name: minioName,
          file_name,
          service_instance_id: context.serviceInstanceId as ServiceInstanceId,
          created_at: new Date(),
          mime_type: payload.document.file.mimetype,
          parent_document_id,
          active: payload.active ?? true,
          labels: payload.labels,
        };

        const [addedDocument] = await createDocument(data);
        return addedDocument;
      } catch (error) {
        console.error('Error while adding document:', error);
        throw UnknownError('INSERT_DOCUMENT_ERROR', { detail: error });
      }
    },
    editDocument: async (_, { documentId, input }, context) => {
      try {
        const [document] = await updateDocumentDescription(
          context,
          input,
          fromGlobalId(documentId).id as DocumentId,
          context.serviceInstanceId as ServiceInstanceId
        );
        return document;
      } catch (error) {
        throw UnknownError('UPDATE_DOCUMENT_ERROR', { detail: error });
      }
    },
    deleteDocument: async (_, { documentId, forceDelete }, context) => {
      try {
        return deleteDocument(
          context,
          fromGlobalId(documentId).id as DocumentId,
          context.serviceInstanceId as ServiceInstanceId,
          forceDelete
        );
      } catch (error) {
        throw UnknownError('DELETE_DOCUMENT_ERROR', { detail: error });
      }
    },
  },
  Document: {
    children_documents: ({ id }, _, context) =>
      getChildrenDocuments(context, id),
    uploader: ({ id }, _, context) => getUploader(context, id),
    labels: ({ id }, context) => getLabels(context, id),
  },
  Query: {
    documentExists: async (_, input) => {
      try {
        return checkDocumentExists(
          input.documentName ?? '',
          fromGlobalId(input.service_instance_id).id as ServiceInstanceId
        );
      } catch (error) {
        logApp.error('Error while fetching documents:', error);
        throw error;
      }
    },
    documents: async (
      _,
      {
        first,
        after,
        orderMode,
        orderBy,
        filter,
        filters,
        serviceInstanceId,
        parentsOnly,
      },
      context
    ) => {
      try {
        return loadDocuments(
          context,
          { first, after, orderMode, orderBy, parentsOnly, filters },
          normalizeDocumentName(filter ?? ''),
          {
            'Document.service_instance_id': fromGlobalId(serviceInstanceId).id,
          } as DocumentMutator
        );
      } catch (error) {
        logApp.error('Error while fetching documents:', error);
        throw error;
      }
    },
    document: async (_, { documentId }, context) => {
      const [parentDocument] = await loadDocumentBy(context, {
        id: fromGlobalId(documentId).id as DocumentId,
      });
      return parentDocument;
    },
  },
};

export default resolvers;
