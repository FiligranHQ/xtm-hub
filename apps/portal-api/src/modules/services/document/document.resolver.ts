import { fromGlobalId } from 'graphql-relay/node/node.js';
import {
  IntegrationType,
  Resolvers,
  SubscriptionModel,
} from '../../../__generated__/resolvers-types';
import Document, { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { MinIOClient } from '../../../thirdparty/minio/client';
import { logApp } from '../../../utils/app-logger.util';
import { UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { extractId } from '../../../utils/utils';
import { loadOrganizationBy } from '../../organizations/organizations.domain';
import { loadSubscriptionBy } from '../../subcription/subscription.domain';
import { telemetryApp } from '../../telemetry/telemetry.app';
import {
  buildShareEvent,
  shouldSendEventForService,
} from '../../telemetry/telemetry.helper';
import { OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE } from '../custom-dashboards/custom-dashboards.domain';
import { OPENCTI_INTEGRATION_DOCUMENT_TYPE } from '../integrations/integrations.model';
import { OPENAEV_SCENARIO_DOCUMENT_TYPE } from '../openaev-scenarios/openaev-scenarios.domain';
import {
  getServiceInstance,
  loadServiceDefinitionByServiceInstance,
} from '../service-instance.domain';
import { DocumentApp } from './document.app';
import {
  checkDocumentExists,
  loadUnsecureDocumentsBy,
  normalizeDocumentName,
  updateDocumentWithCounters,
} from './document.helper';
import { waitForUploads } from './document.uploads.helper';
import { DocumentChildrenDomain } from './domain/document.children.domain';
import { DocumentDomain } from './domain/document.domain';
import { DocumentMetadataDomain } from './domain/document.metadata.domain';

const resolvers: Resolvers = {
  Mutation: {
    createDocument: async (
      _,
      { input, document, serviceInstanceId, metadata }
    ) => {
      try {
        return await DocumentApp.createDocument(
          input,
          metadata,
          extractId<ServiceInstanceId>(serviceInstanceId),
          document
        );
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
    addDocument: async (
      _,
      { document, parentDocumentId, service_instance_id, ...payload }
    ) => {
      try {
        await waitForUploads(document);
        const extractedServiceInstanceId =
          extractId<ServiceInstanceId>(service_instance_id);
        const { minioName, fileName, mimeType } = await MinIOClient.createFile(
          document,
          extractedServiceInstanceId
        );
        return await DocumentApp.createDocumentWithChildrenAndMetadata<Document>(
          {
            ...payload,
            service_instance_id: extractedServiceInstanceId,
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
        return await DocumentApp.updateDocument(
          extractId<DocumentId>(documentId),
          input,
          []
        );
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.UpdateDocumentError);
      }
    },
    deleteDocument: async (
      _,
      { documentId, forceDelete, service_instance_id }
    ) => {
      try {
        return await DocumentApp.deleteDocument(
          extractId<DocumentId>(documentId),
          extractId<ServiceInstanceId>(service_instance_id),
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
        [IntegrationType.Connector]: 'Connector',
        [IntegrationType.CsvFeed]: 'CsvFeed',
      };
      if (TYPE_MAPPINGS[document.type]) {
        return TYPE_MAPPINGS[document.type];
      } else if (document.type === OPENCTI_INTEGRATION_DOCUMENT_TYPE) {
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
      DocumentChildrenDomain.loadChildrenDocuments(id),
    uploader: ({ id }, _) => DocumentDomain.loadUploader(id),
    uploader_organization: ({ id }, _) =>
      DocumentDomain.loadUploaderOrganization(id),
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
        return DocumentDomain.loadDocuments(
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
