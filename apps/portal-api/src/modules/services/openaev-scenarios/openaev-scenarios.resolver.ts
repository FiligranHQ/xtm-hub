import { dbTx } from '../../../../knexfile';
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
import {
  deleteDocument,
  getUploader,
  getUploaderOrganization,
  loadImagesByDocumentId,
  loadParentDocumentsByServiceInstance,
  loadSeoDocumentsByServiceSlug,
  updateDocumentWithChildren,
} from '../document/document.domain';
import { getServiceInstance } from '../service-instance.domain';
import { OpenAEVScenariosApp } from './openaev-scenarios.app';
import {
  OPENAEV_SCENARIO_DOCUMENT_TYPE,
  OPENAEV_SCENARIO_METADATA,
  OpenAEVScenario,
} from './openaev-scenarios.domain';

const resolvers: Resolvers = {
  SeoOpenAEVScenario: {
    children_documents: ({ id }) => loadImagesByDocumentId(id),
    uploader: ({ id }, _, context) =>
      getUploader(context, id, {
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
    children_documents: ({ id }) => loadImagesByDocumentId(id),
    uploader: ({ id }, _, context) =>
      getUploader(context, id, { unsecured: true }),
    uploader_organization: ({ id }, _, context) =>
      getUploaderOrganization(context, id, { unsecured: true }),
    service_instance: ({ service_instance_id }, _) =>
      getServiceInstance(service_instance_id as ServiceInstanceId),
    subscription: ({ service_instance_id }, _, context) =>
      subscriptionApp.loadSubscriptionModel(context, service_instance_id),
  },
  Query: {
    seoOpenAEVScenariosByServiceSlug: async (_, { serviceSlug }) => {
      return await loadSeoDocumentsByServiceSlug(
        OPENAEV_SCENARIO_DOCUMENT_TYPE,
        serviceSlug,
        OPENAEV_SCENARIO_METADATA
      );
    },
    seoOpenAEVScenarioBySlug: async (_, { slug }) => {
      return OpenAEVScenariosApp.loadSeoOpenAEVScenario(slug);
    },
    openAEVScenarios: async (_, input, context) => {
      return loadParentDocumentsByServiceInstance<OpenAevScenarioConnection>(
        OPENAEV_SCENARIO_DOCUMENT_TYPE,
        context,
        input,
        OPENAEV_SCENARIO_METADATA
      );
    },
    openAEVScenario: async (_, { id }, context) =>
      OpenAEVScenariosApp.loadOpenAEVScenario(
        context,
        extractId<DocumentId>(id)
      ),
  },
  Mutation: {
    createOpenAEVScenario: async (_, { input, document }, context) => {
      try {
        return await OpenAEVScenariosApp.createOpenAEVScenario(
          context,
          input,
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
    updateOpenAEVScenario: async (_, input, context) => {
      const trx = await dbTx();
      try {
        const doc = await updateDocumentWithChildren<OpenAEVScenario>(
          OPENAEV_SCENARIO_DOCUMENT_TYPE,
          extractId<DocumentId>(input.documentId),
          input,
          OPENAEV_SCENARIO_METADATA,
          context,
          trx
        );
        await trx.commit();
        return doc;
      } catch (error) {
        await trx.rollback();
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
      const trx = await dbTx();
      try {
        const doc = await deleteDocument<OpenAEVScenario>(
          context,
          extractId<DocumentId>(id),
          context.serviceInstanceId as ServiceInstanceId,
          true,
          trx
        );
        await trx.commit();
        return doc;
      } catch (error) {
        await trx.rollback();

        throw mapToGraphQLError(
          error,
          UnknownErrorCode.OpenAEVScenarioDeleteError
        );
      }
    },
  },
};

export default resolvers;
