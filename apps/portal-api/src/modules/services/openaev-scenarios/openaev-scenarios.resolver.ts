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
import { DocumentApp } from '../document/document.app';
import { DocumentChildrenDomain } from '../document/domain/document.children.domain';
import { DocumentDomain } from '../document/domain/document.domain';
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
    uploader: ({ id }, _) =>
      DocumentDomain.loadUploader(id, {
        unsecured: true,
      }),
    labels: ({ id }) =>
      labelsDomain.loadLabelsByDocumentId(id, {
        unsecured: true,
      }),
  },
  OpenAEVScenario: {
    labels: ({ id }) =>
      labelsDomain.loadLabelsByDocumentId(id, { unsecured: true }),
    children_documents: ({ id }) =>
      DocumentChildrenDomain.loadImagesByDocumentId(id),
    uploader: ({ id }, _) =>
      DocumentDomain.loadUploader(id, { unsecured: true }),
    uploader_organization: ({ id }, _) =>
      DocumentDomain.loadUploaderOrganization(id, { unsecured: true }),
    service_instance: ({ service_instance_id }, _) =>
      getServiceInstance(service_instance_id as ServiceInstanceId),
    subscription: ({ service_instance_id }, _, context) =>
      subscriptionApp.loadSubscriptionModel(context, service_instance_id),
  },
  Query: {
    seoOpenAEVScenariosByServiceSlug: async (_, { serviceSlug }) => {
      return DocumentDomain.loadSeoDocumentsByServiceSlug(
        OPENAEV_SCENARIO_DOCUMENT_TYPE,
        serviceSlug,
        OPENAEV_SCENARIO_METADATA
      );
    },
    seoOpenAEVScenarioBySlug: async (_, { slug }) => {
      return OpenAEVScenariosApp.loadSeoOpenAEVScenario(slug);
    },
    openAEVScenarios: async (_, input) => {
      return DocumentDomain.loadParentDocumentsByServiceInstance<OpenAevScenarioConnection>(
        OPENAEV_SCENARIO_DOCUMENT_TYPE,
        input,
        OPENAEV_SCENARIO_METADATA
      );
    },
    openAEVScenario: async (_, { id }) =>
      OpenAEVScenariosApp.loadOpenAEVScenario(extractId<DocumentId>(id)),
  },
  Mutation: {
    createOpenAEVScenario: async (_, { input, document }) => {
      try {
        return OpenAEVScenariosApp.createOpenAEVScenario(input, document);
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
        return DocumentApp.updateDocumentWithChildren<OpenAEVScenario>(
          OPENAEV_SCENARIO_DOCUMENT_TYPE,
          extractId<DocumentId>(input.documentId),
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
    deleteOpenAEVScenario: async (_, { id }, context) => {
      try {
        return DocumentApp.deleteDocument<OpenAEVScenario>(
          extractId<DocumentId>(id),
          context.serviceInstanceId as ServiceInstanceId,
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
