import {
  IntegrationType,
  Resolvers,
  ShareableResource,
  SubscriptionModel,
} from '../../__generated__/resolvers-types';
import { DocumentId } from '../../model/kanel/public/Document';
import { logApp } from '../../utils/app-logger.util';
import { toError } from '../../utils/error/error-guard.util';
import { ErrorCode, UnknownErrorCode } from '../../utils/error/error.code';
import { mapToGraphQLError } from '../../utils/error/error.mapping';
import { AlreadyExistsError } from '../../utils/error/error.util';
import { createRelayIdScalar } from '../../utils/scalar.util';
import { nullsToUndefined } from '../../utils/typescript';
import { OrganizationDomain } from '../organization-management/organization/organization.domain';
import {
  getServiceInstance,
  loadServiceDefinitionByServiceInstance,
} from '../service/instance/service-instance.domain';
import { OPENAEV_SCENARIO_DOCUMENT_TYPE } from '../shareable-resource/openaev/scenario/scenario.model';
import { OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE } from '../shareable-resource/opencti/custom-dashboard/custom-dashboard.model';
import { OPENCTI_INTEGRATION_DOCUMENT_TYPE } from '../shareable-resource/opencti/integration/integration.model';
import { OPENCTI_PLAYBOOK_DOCUMENT_TYPE } from '../shareable-resource/opencti/playbook/playbook.model';
import { SubscriptionDomain } from '../subscription/subscription.domain';
import { telemetryApp } from '../telemetry/telemetry.app';
import {
  buildShareEvent,
  shouldSendEventForService,
} from '../telemetry/telemetry.helper';
import { DocumentApp } from './document.app';
import { DocumentHelper } from './document.helper';
import { DOCUMENT_IMAGE_METADATA_KEYS } from './document.model';
import { DocumentChildrenDomain } from './domain/document.children.domain';
import { DocumentDomain } from './domain/document.domain';
import { DocumentMetadataDomain } from './domain/document.metadata.domain';

const resolvers: Resolvers = {
  DocumentId: createRelayIdScalar<DocumentId>('Document'),

  Mutation: {
    createDocument: async (_, input) => {
      try {
        return await DocumentApp.createDocument({
          ...nullsToUndefined(input),
          serviceInstanceId: input.serviceInstanceId,
        });
      } catch (error) {
        const normalizedError = toError(error);
        if (normalizedError.message.includes('document_type_slug_unique')) {
          throw AlreadyExistsError(ErrorCode.DocumentUniqueSlugError, {
            detail: normalizedError,
          });
        }
        throw mapToGraphQLError(error, UnknownErrorCode.DocumentCreateError);
      }
    },
    updateDocument: async (_, input) => {
      try {
        return await DocumentApp.updateDocument({
          ...nullsToUndefined(input),
          parentDocumentId: input.documentId,
          serviceInstanceId: input.serviceInstanceId,
          existingImageIds: input.existingImageIds ?? [],
        });
      } catch (error) {
        const normalizedError = toError(error);
        if (normalizedError.message.includes('document_type_slug_unique')) {
          throw AlreadyExistsError(ErrorCode.DocumentUniqueSlugError, {
            detail: normalizedError,
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
          documentId,
          service_instance_id,
          forceDelete ?? false
        );
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.DeleteDocumentError);
      }
    },
    incrementShareNumberDocument: async (_, { documentId }, context) => {
      try {
        const document = await DocumentDomain.loadDocumentWithMetadataById(
          documentId,
          []
        );
        const documentWithCounters =
          await DocumentHelper.updateDocumentWithCounters(document);
        try {
          if (!document.service_instance_id) {
            throw new Error(ErrorCode.ServiceInstanceNotFound);
          }
          const serviceDefinition =
            await loadServiceDefinitionByServiceInstance(
              document.service_instance_id
            );
          if (!serviceDefinition) {
            throw new Error(ErrorCode.ServiceDefinitionNotFound);
          }

          if (shouldSendEventForService(serviceDefinition.identifier)) {
            const selectedOrga = context.user
              ? await OrganizationDomain.loadOrganizationBy({
                  id: context.user.selected_organization_id,
                })
              : undefined;

            const shareEvent = await buildShareEvent(
              selectedOrga,
              context.user?.id,
              serviceDefinition.identifier,
              document.id,
              document.name ?? ''
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
    async __resolveType(document) {
      const TYPE_MAPPINGS = {
        [OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE]: 'CustomDashboard',
        [OPENAEV_SCENARIO_DOCUMENT_TYPE]: 'OpenAEVScenario',
        [OPENCTI_PLAYBOOK_DOCUMENT_TYPE]: 'OpenCTIPlaybook',
      };
      const INTEGRATION_MAPPINGS = {
        [IntegrationType.Connector]: 'Connector',
        [IntegrationType.CsvFeed]: 'CsvFeed',
        [IntegrationType.TaxiiFeed]: 'TaxiiFeed',
        [IntegrationType.RssFeed]: 'RssFeed',
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
      return getServiceInstance(service_instance_id);
    },
    subscription: async ({ service_instance_id }, _, context) => {
      const subscription = await SubscriptionDomain.loadSubscriptionBy({
        service_instance_id,
        organization_id: context.user.selected_organization_id,
      });

      return subscription as unknown as SubscriptionModel;
    },
  },
  Query: {
    documentExists: async (_, input) => {
      try {
        return DocumentHelper.checkDocumentExists(
          input.documentName ?? '',
          input.service_instance_id
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
        return DocumentApp.loadPublicDocumentBySlug(serviceInstanceId, slug);
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
    document: async (_, { documentId }) => DocumentApp.loadDocument(documentId),
  },
};

export default resolvers;
