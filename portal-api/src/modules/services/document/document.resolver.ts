import { fromGlobalId } from 'graphql-relay/node/node.js';
import { Resolvers } from '../../../__generated__/resolvers-types';
import Document, {
  DocumentId,
  DocumentMutator,
} from '../../../model/kanel/public/Document';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { logApp } from '../../../utils/app-logger.util';
import { UnknownError } from '../../../utils/error.util';
import { extractId, omit } from '../../../utils/utils';
import { loadSubscription } from '../../subcription/subscription.domain';
import { getServiceInstance } from '../service-instance.domain';
import {
  deleteDocument,
  getChildrenDocuments,
  getUploader,
  getUploaderOrganization,
  incrementShareNumber,
  loadDocuments,
  sendFileToS3,
  updateDocumentDescription,
} from './document.domain';
import {
  checkDocumentExists,
  createDocument,
  loadDocumentById,
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

        const addedDocument = await createDocument<Document>(context, {
          ...omit(payload, ['service_instance_id']),
          minio_name: minioName,
          file_name,
          mime_type: payload.document.file.mimetype,
          parent_document_id,
        });
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
          input.uploader_organization_id
            ? ({
                ...input,
                uploader_organization_id: extractId<OrganizationId>(
                  input.uploader_organization_id
                ),
              } as DocumentMutator)
            : input,
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
    incrementShareNumberDocument: async (_, { documentId }) => {
      try {
        const [result] = await incrementShareNumber(
          extractId<DocumentId>(documentId)
        );
        return result;
      } catch (error) {
        throw UnknownError('INCREMENT_SHARE_NUMBER', { detail: error });
      }
    },
  },
  Document: {
    children_documents: ({ id }, _, context) =>
      getChildrenDocuments(context, id, {
        unsecured: true,
      }),
    uploader: ({ id }, _, context) =>
      getUploader(context, id, {
        unsecured: true,
      }),
    uploader_organization: ({ id }, _, context) =>
      getUploaderOrganization(context, id, {
        unsecured: true,
      }),
    service_instance: ({ service_instance_id }, _, context) => {
      return getServiceInstance(context, service_instance_id);
    },
    subscription: ({ service_instance_id }, _, context) => {
      return loadSubscription(context, service_instance_id);
    },
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
        searchTerm,
        filters,
        serviceInstanceId,
        parentsOnly,
      },
      context
    ) => {
      try {
        return loadDocuments(
          context,
          {
            first,
            after,
            orderMode,
            orderBy,
            parentsOnly,
            filters,
            searchTerm: normalizeDocumentName(searchTerm ?? ''),
          },
          {
            'Document.service_instance_id': fromGlobalId(serviceInstanceId).id,
          }
        );
      } catch (error) {
        logApp.error('Error while fetching documents:', error);
        throw error;
      }
    },
    document: async (_, { documentId }, context) =>
      loadDocumentById(context, extractId<DocumentId>(documentId)),
  },
};

export default resolvers;
