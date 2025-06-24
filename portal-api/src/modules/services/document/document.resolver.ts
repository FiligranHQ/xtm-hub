import { fromGlobalId } from 'graphql-relay/node/node.js';
import { dbTx } from '../../../../knexfile';
import { Resolvers } from '../../../__generated__/resolvers-types';
import Document, { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { logApp } from '../../../utils/app-logger.util';
import { UnknownError } from '../../../utils/error.util';
import { extractId, omit } from '../../../utils/utils';
import { loadSubscription } from '../../subcription/subscription.domain';
import { getServiceInstance } from '../service-instance.domain';
import {
  createDocument,
  deleteDocument,
  getChildrenDocuments,
  getUploader,
  getUploaderOrganization,
  incrementShareNumber,
  loadDocumentById,
  loadDocuments,
  updateDocument,
} from './document.domain';
import {
  checkDocumentExists,
  createFileInMinIO,
  normalizeDocumentName,
  waitForUploads,
} from './document.helper';

const resolvers: Resolvers = {
  Mutation: {
    addDocument: async (
      _,
      { document, parentDocumentId, ...payload },
      context
    ) => {
      const trx = await dbTx();
      try {
        await waitForUploads(document);
        const { minioName, fileName, mimeType } = await createFileInMinIO(
          document,
          context
        );

        const addedDocument = await createDocument<Document>(context, {
          ...omit(payload, ['service_instance_id']),
          minio_name: minioName,
          file_name: fileName,
          mime_type: mimeType,
          parent_document_id: parentDocumentId
            ? extractId<DocumentId>(parentDocumentId)
            : null,
        }, [], trx);
        await trx.commit();
        return addedDocument;
      } catch (error) {
        await trx.rollback();
        console.error('Error while adding document:', error);
        throw UnknownError('INSERT_DOCUMENT_ERROR', { detail: error });
      }
    },
    editDocument: async (_, { documentId, input }, context) => {
      const trx = await dbTx();
      try {
        const document = await updateDocument(
          context,
          extractId<DocumentId>(documentId),
          input, [], trx
        );
        await trx.commit();
        return document;
      } catch (error) {
        await trx.rollback();
        throw UnknownError('UPDATE_DOCUMENT_ERROR', { detail: error });
      }
    },
    deleteDocument: async (_, { documentId, forceDelete }, context) => {
      const trx = await dbTx();
      try {
        const doc = await deleteDocument(
          context,
          fromGlobalId(documentId).id as DocumentId,
          context.serviceInstanceId as ServiceInstanceId,
          forceDelete,
          trx
        );
        await trx.commit();
        return doc;
      } catch (error) {
        await trx.rollback();
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
