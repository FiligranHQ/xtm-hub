import {
  OpenAevScenarioConnection,
  Resolvers,
} from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { ErrorCode, UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { AlreadyExistsError } from '../../../utils/error/error.util';
import { extractId } from '../../../utils/utils';
import { labelsDomain } from '../../settings/labels/labels.domain';
import { subscriptionApp } from '../../subcription/subscription.app';
import { DocumentChildrenDomain } from '../document/domain/document.children.domain';
import {
  deleteDocument,
  getUploader,
  loadParentDocumentsByServiceInstance,
  loadSeoDocumentsByServiceSlug,
  loadUploaderOrganization,
  updateDocumentWithChildren,
} from '../document/domain/document.domain';
import { getServiceInstance } from '../service-instance.domain';
import { OpenAEVScenariosApp } from './openaev-scenarios.app';
import {
  OPENAEV_SCENARIO_DOCUMENT_TYPE,
  OPENAEV_SCENARIO_METADATA,
  OpenAEVScenario,
} from './openaev-scenarios.domain';

const resolvers: Resolvers = {
  SeoOpenAEVScenario: {
    children_documents: ({ id }) =>
      DocumentChildrenDomain.loadImagesByDocumentId(id),
    uploader: ({ id }, _) => getUploader(id),
    labels: ({ id }) => labelsDomain.loadLabelsByDocumentId(id),
  },
  OpenAEVScenario: {
    labels: ({ id }) => labelsDomain.loadLabelsByDocumentId(id),
    children_documents: ({ id }) =>
      DocumentChildrenDomain.loadImagesByDocumentId(id),
    uploader: ({ id }, _) => getUploader(id),
    uploader_organization: ({ id }, _) => loadUploaderOrganization(id),
    service_instance: ({ service_instance_id }, _) =>
      getServiceInstance(service_instance_id as ServiceInstanceId),
    subscription: ({ service_instance_id }, _, context) =>
      subscriptionApp.loadSubscriptionModel(context, service_instance_id),
  },
  Query: {
    seoOpenAEVScenariosByServiceSlug: async (_, { serviceSlug }) => {
      return loadSeoDocumentsByServiceSlug(
        OPENAEV_SCENARIO_DOCUMENT_TYPE,
        serviceSlug,
        OPENAEV_SCENARIO_METADATA
      );
    },
    seoOpenAEVScenarioBySlug: async (_, { slug }) => {
      return OpenAEVScenariosApp.loadSeoOpenAEVScenario(slug);
    },
    openAEVScenarios: async (_, input) => {
      return loadParentDocumentsByServiceInstance<OpenAevScenarioConnection>(
        OPENAEV_SCENARIO_DOCUMENT_TYPE,
        input,
        OPENAEV_SCENARIO_METADATA
      );
    },
    openAEVScenario: async (_, { id }) =>
      OpenAEVScenariosApp.loadOpenAEVScenario(extractId<DocumentId>(id)),
  },
  Mutation: {
    createOpenAEVScenario: async (
      _,
      { input, document, serviceInstanceId }
    ) => {
      try {
        return OpenAEVScenariosApp.createOpenAEVScenario(
          {
            ...input,
            service_instance_id:
              extractId<ServiceInstanceId>(serviceInstanceId),
          },
          document
        );
      } catch (error) {
        if (error.message?.includes('document_type_slug_unique')) {
          throw AlreadyExistsError(ErrorCode.OpenAEVScenarioUniqueSlugError, {
            detail: error,
          });
        }
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.OpenAEVScenarioInsertionError
        );
      }
    },
    updateOpenAEVScenario: async (_, input) => {
      try {
        return updateDocumentWithChildren<OpenAEVScenario>(
          OPENAEV_SCENARIO_DOCUMENT_TYPE,
          extractId<DocumentId>(input.documentId),
          extractId<ServiceInstanceId>(input.serviceInstanceId),
          input,
          OPENAEV_SCENARIO_METADATA
        );
      } catch (error) {
        if (error.message?.includes('document_type_slug_unique')) {
          throw AlreadyExistsError(ErrorCode.OpenAEVScenarioUniqueSlugError, {
            detail: error,
          });
        }
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.OpenAEVScenarioUpdateError
        );
      }
    },
    deleteOpenAEVScenario: async (_, { id, serviceInstanceId }) => {
      try {
        return deleteDocument<OpenAEVScenario>(
          extractId<DocumentId>(id),
          extractId<ServiceInstanceId>(serviceInstanceId),
          true
        );
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.OpenAEVScenarioDeleteError
        );
      }
    },
  },
};

export default resolvers;
