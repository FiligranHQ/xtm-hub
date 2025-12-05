import { fromGlobalId } from 'graphql-relay/node/node.js';
import {
  IntegrationFeedType,
  Resolvers,
  SubscriptionModel,
} from '../../../__generated__/resolvers-types';
import Document, { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { MinIOClient } from '../../../thirdparty/minio/client';
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
import { OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE } from '../custom-dashboards/custom-dashboards.domain';
import { OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE } from '../integration-feeds/integration-feeds.model';
import { OPENAEV_SCENARIO_DOCUMENT_TYPE } from '../openaev-scenarios/openaev-scenarios.domain';
import {
  getServiceInstance,
  loadServiceDefinitionByServiceInstance,
} from '../service-instance.domain';
import {
  checkDocumentExists,
  loadUnsecureDocumentsBy,
  normalizeDocumentName,
  updateDocumentWithCounters,
} from './document.helper';
import { waitForUploads } from './document.uploads.helper';
import { DocumentChildrenDomain } from './domain/document.children.domain';
import {
  createDocument,
  deleteDocument,
  DocumentDomain,
  getUploader,
  loadDocuments,
  loadUploaderOrganization,
  updateDocument,
} from './domain/document.domain';
import { DocumentMetadataDomain } from './domain/document.metadata.domain';

const resolvers: Resolvers = {
  Mutation: {
    addDocument: async (_, { document, parentDocumentId, ...payload }) => {
      try {
        await waitForUploads(document);
        const { minioName, fileName, mimeType } =
          await MinIOClient.createFile(document);

        return await createDocument<Document>(
          {
            ...omit(payload, ['service_instance_id']),
            minio_name: minioName,
            file_name: fileName,
            mime_type: mimeType,
            parent_document_id: parentDocumentId
              ? extractId<DocumentId>(parentDocumentId)
              : null,
          },
          []
        );
      } catch (error) {
        console.error('Error while adding document:', error);
        throw mapToGraphQLError(error, UnknownErrorCode.InsertDocumentError);
      }
    },
    editDocument: async (_, { documentId, input }) => {
      try {
        return await updateDocument(
          extractId<DocumentId>(documentId),
          input,
          []
        );
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.UpdateDocumentError);
      }
    },
    deleteDocument: async (_, { documentId, forceDelete }, context) => {
      try {
        return await deleteDocument(
          fromGlobalId(documentId).id as DocumentId,
          context.serviceInstanceId as ServiceInstanceId,
          forceDelete
        );
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.DeleteDocumentError);
      }
    },
    incrementShareNumberDocument: async (_, { documentId }, context) => {
      try {
        const [document] = await loadUnsecureDocumentsBy({
          id: extractId<DocumentId>(documentId),
        });
        const documentWithCounters = await updateDocumentWithCounters(document);
        try {
          const serviceDefinition =
            await loadServiceDefinitionByServiceInstance(
              document.service_instance_id
            );

          if (shouldSendEventForService(serviceDefinition.identifier)) {
            const selectedOrga = context.user
              ? await loadOrganizationBy({
                  id: context.user.selected_organization_id,
                })
              : undefined;

            const shareEvent = await buildShareEvent(
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
        return documentWithCounters;
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.IncrementShareNumberError
        );
      }
    },
  },
  Document: {
    async __resolveType(document: Document) {
      const TYPE_MAPPINGS = {
        [OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE]: 'CustomDashboard',
        [OPENAEV_SCENARIO_DOCUMENT_TYPE]: 'OpenAEVScenario',
      };
      const INTEGRATION_MAPPINGS = {
        [IntegrationFeedType.Connector]: 'Connector',
        [IntegrationFeedType.CsvFeed]: 'CsvFeed',
      };
      if (TYPE_MAPPINGS[document.type]) {
        return TYPE_MAPPINGS[document.type];
      } else if (document.type === OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE) {
        const integrationType =
          await DocumentMetadataDomain.loadIntegrationType(document.id);
        const responseType = INTEGRATION_MAPPINGS[integrationType];
        if (responseType) {
          return responseType;
        }
      }
      logApp.warn(
        `Document resolver type - Unresolved document type ${document.type}`
      );
      return 'DefaultDocument';
    },

    children_documents: ({ id }, _) =>
      DocumentChildrenDomain.loadChildrenDocuments(id, {
        unsecured: true,
      }),
    uploader: ({ id }, _) =>
      getUploader(id, {
        unsecured: true,
      }),
    uploader_organization: ({ id }, _) =>
      loadUploaderOrganization(id, {
        unsecured: true,
      }),
    service_instance: ({ service_instance_id }, _) => {
      return getServiceInstance(service_instance_id as ServiceInstanceId);
    },
    subscription: async ({ service_instance_id }, _, context) => {
      const subscription = await loadSubscriptionBy({
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
      }
    ) => {
      try {
        return loadDocuments(
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
    document: async (_, { documentId }) =>
      DocumentDomain.loadDocumentWithMetadataById(
        extractId<DocumentId>(documentId)
      ),
  },
};

export default resolvers;
