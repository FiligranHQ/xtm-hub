import { fromGlobalId } from 'graphql-relay/node/node.js';
import { dbTx } from '../../../../knexfile';
import {
  Resolvers,
  SubscriptionModel,
} from '../../../__generated__/resolvers-types';
import Document, { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { logApp } from '../../../utils/app-logger.util';
import { UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { extractId, omit } from '../../../utils/utils';
import { loadOrganizationBy } from '../../organizations/organizations.domain';
import { loadSubscriptionBy } from '../../subcription/subscription.domain';
import { telemetryApp } from '../../telemetry/telemetry.app';
import {
  buildShareEvent,
  shouldSendEventForService,
} from '../../telemetry/telemetry.helper';
import {
  getServiceInstance,
  loadServiceDefinitionByServiceInstance,
} from '../service-instance.domain';
import {
  createDocument,
  deleteDocument,
  getChildrenDocuments,
  getUploader,
  getUploaderOrganization,
  loadDocumentById,
  loadDocuments,
  updateDocument,
} from './document.domain';
import {
  checkDocumentExists,
  createFileInMinIO,
  loadUnsecureDocumentsBy,
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

        const addedDocument = await createDocument<Document>(
          context,
          {
            ...omit(payload, ['service_instance_id']),
            minio_name: minioName,
            file_name: fileName,
            mime_type: mimeType,
            parent_document_id: parentDocumentId
              ? extractId<DocumentId>(parentDocumentId)
              : null,
          },
          [],
          trx
        );
        await trx.commit();
        return addedDocument;
      } catch (error) {
        await trx.rollback();
        console.error('Error while adding document:', error);
        throw mapToGraphQLError(error, UnknownErrorCode.InsertDocumentError);
      }
    },
    editDocument: async (_, { documentId, input }, context) => {
      const trx = await dbTx();
      try {
        const document = await updateDocument(
          context,
          extractId<DocumentId>(documentId),
          input,
          [],
          trx
        );
        await trx.commit();
        return document;
      } catch (error) {
        await trx.rollback();
        throw mapToGraphQLError(error, UnknownErrorCode.UpdateDocumentError);
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
        throw mapToGraphQLError(error, UnknownErrorCode.DeleteDocumentError);
      }
    },
    incrementShareNumberDocument: async (_, { documentId }, context) => {
      try {
        const [document] = await loadUnsecureDocumentsBy({
          id: extractId<DocumentId>(documentId),
        });
        try {
          const serviceDefinition =
            await loadServiceDefinitionByServiceInstance(
              context,
              document.service_instance_id
            );

          if (shouldSendEventForService(serviceDefinition.identifier)) {
            const selectedOrga = context.user
              ? await loadOrganizationBy({
                  id: context.user.selected_organization_id,
                })
              : undefined;

            const shareEvent = buildShareEvent(
              selectedOrga,
              context.user?.id,
              serviceDefinition.identifier,
              document.id,
              document.name
            );
            telemetryApp.sendTelemetryEvent(shareEvent);
          }
        } catch (error) {
          logApp.error('Unable to send telemetry event', {
            error,
          });
        }
        return document;
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.IncrementShareNumberError
        );
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
    subscription: async ({ service_instance_id }, _, context) => {
      const subscription = await loadSubscriptionBy(context, {
        service_instance_id: service_instance_id as ServiceInstanceId,
        organization_id: context.user.selected_organization_id,
      });

      return subscription as unknown as SubscriptionModel;
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
        throw mapToGraphQLError(error);
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
        throw mapToGraphQLError(error);
      }
    },
    document: async (_, { documentId }, context) =>
      loadDocumentById(context, extractId<DocumentId>(documentId)),
  },
};

export default resolvers;
