import { fromGlobalId } from 'graphql-relay/node/node.js';
import {
  IntegrationType,
  Resolvers,
  ShareableResource,
  SubscriptionModel,
} from '../../../__generated__/resolvers-types';
import Document, { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { logApp } from '../../../utils/app-logger.util';
import { ErrorCode, UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { AlreadyExistsError } from '../../../utils/error/error.util';
import { extractId } from '../../../utils/utils';
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
import { DocumentApp } from './document.app';
import {
  checkDocumentExists,
  updateDocumentWithCounters,
} from './document.helper';
import { DOCUMENT_IMAGE_METADATA_KEYS } from './document.model';
import { DocumentChildrenDomain } from './domain/document.children.domain';
import { DocumentDomain } from './domain/document.domain';
import { DocumentMetadataDomain } from './domain/document.metadata.domain';
import { OPENAEV_SCENARIO_DOCUMENT_TYPE } from './openaev/scenarios/scenarios.model';
import { OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE } from './opencti/custom-dashboards/custom-dashboards.model';
import { OPENCTI_INTEGRATION_DOCUMENT_TYPE } from './opencti/integrations/integrations.model';

const resolvers: Resolvers = {
  Mutation: {
    createDocument: async (
      _,
      { input, document, serviceInstanceId, metadata, logo, images }
    ) => {
      try {
        return await DocumentApp.createDocument({
          input,
          metadata,
          serviceInstanceId: extractId<ServiceInstanceId>(serviceInstanceId),
          document,
          logo,
          images,
        });
      } catch (error) {
        if (error.message?.includes('document_type_slug_unique')) {
          throw AlreadyExistsError(ErrorCode.DocumentUniqueSlugError, {
            detail: error,
          });
        }
        throw mapToGraphQLError(error, UnknownErrorCode.DocumentCreateError);
      }
    },
    updateDocument: async (_, input) => {
      try {
        return await DocumentApp.updateDocument({
          parentDocumentId: extractId<DocumentId>(input.documentId),
          serviceInstanceId: extractId<ServiceInstanceId>(
            input.serviceInstanceId
          ),
          metadata: input.metadata,
          document: input.document,
          updateDocument: input.updateDocument,
          images: input.images,
          input: input.input,
        });
      } catch (error) {
        if (error.message?.includes('document_type_slug_unique')) {
          throw AlreadyExistsError(ErrorCode.DocumentUniqueSlugError, {
            detail: error,
          });
        }
        throw mapToGraphQLError(error, UnknownErrorCode.DocumentUpdateError);
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
        const document = await DocumentDomain.loadDocumentWithMetadataById(
          extractId<DocumentId>(documentId),
          []
        );
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
            await telemetryApp.sendTelemetryEvent(shareEvent);
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
        [IntegrationType.TaxiiFeed]: 'TaxiiFeed',
        [IntegrationType.Stream]: 'Stream',
        [IntegrationType.ThirdPartyIntegration]: 'ThirdPartyIntegration',
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

    children_documents: async ({ id }, _) =>
      (await DocumentChildrenDomain.loadChildrenDocuments(
        id,
        DOCUMENT_IMAGE_METADATA_KEYS
      )) as ShareableResource[],
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
        throw mapToGraphQLError(error);
      }
    },
    publicDocuments: async (_, input) => {
      try {
        return DocumentApp.loadPublicDocuments(input);
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
    publicDocumentsByServiceSlug: async (_, { serviceInstanceSlug }) => {
      try {
        return DocumentApp.loadPublicDocumentsByServiceSlug(
          serviceInstanceSlug
        );
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
    publicDocumentBySlug: async (_, { serviceInstanceId, slug }) => {
      try {
        return DocumentApp.loadPublicDocumentBySlug(
          extractId<ServiceInstanceId>(serviceInstanceId),
          slug
        );
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
    documents: async (_, input) => {
      try {
        return DocumentApp.loadDocuments(input);
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
    document: async (_, { documentId }) =>
      DocumentApp.loadDocument(extractId<DocumentId>(documentId)),
  },
};

export default resolvers;
