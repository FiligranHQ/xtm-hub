import { dbTx } from '../../../../knexfile';
import {
  OpenAevScenarioConnection,
  Resolvers,
} from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { AlreadyExistsError, UnknownError } from '../../../utils/error.util';
import { extractId } from '../../../utils/utils';
import { loadSubscription } from '../../subcription/subscription.domain';
import {
  createDocumentWithChildren,
  deleteDocument,
  getLabels,
  getUploader,
  getUploaderOrganization,
  loadDocumentById,
  loadImagesByDocumentId,
  loadParentDocumentsByServiceInstance,
  loadSeoDocumentBySlug,
  loadSeoDocumentsByServiceSlug,
  updateDocumentWithChildren,
} from '../document/document.domain';
import { getServiceInstance } from '../service-instance.domain';
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
    labels: ({ id }, _, context) =>
      getLabels(context, id, {
        unsecured: true,
      }),
  },
  OpenAEVScenario: {
    labels: ({ id }, _, context) => getLabels(context, id, { unsecured: true }),
    children_documents: ({ id }) => loadImagesByDocumentId(id),
    uploader: ({ id }, _, context) =>
      getUploader(context, id, { unsecured: true }),
    uploader_organization: ({ id }, _, context) =>
      getUploaderOrganization(context, id, { unsecured: true }),
    service_instance: ({ service_instance_id }, _, context) =>
      getServiceInstance(context, service_instance_id),
    subscription: ({ service_instance_id }, _, context) =>
      loadSubscription(context, service_instance_id),
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
      return loadSeoDocumentBySlug(
        OPENAEV_SCENARIO_DOCUMENT_TYPE,
        slug,
        OPENAEV_SCENARIO_METADATA
      );
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
      loadDocumentById(
        context,
        extractId<DocumentId>(id),
        OPENAEV_SCENARIO_METADATA
      ),
  },
  Mutation: {
    createOpenAEVScenario: async (_, { input, document }, context) => {
      const trx = await dbTx();
      try {
        const doc = await createDocumentWithChildren<OpenAEVScenario>(
          OPENAEV_SCENARIO_DOCUMENT_TYPE,
          input,
          document,
          OPENAEV_SCENARIO_METADATA,
          context,
          trx
        );
        await trx.commit();
        return doc;
      } catch (error) {
        await trx.rollback();
        if (error.message?.includes('document_type_slug_unique')) {
          throw AlreadyExistsError('OBAS_SCENARIO_UNIQUE_SLUG_ERROR', {
            detail: error,
          });
        }
        throw UnknownError('OBAS_SCENARIO_INSERTION_ERROR', {
          detail: error,
        });
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
          throw AlreadyExistsError('OBAS_SCENARIO_UNIQUE_SLUG_ERROR', {
            detail: error,
          });
        }
        throw UnknownError('OBAS_SCENARIO_UPDATE_ERROR', {
          detail: error,
        });
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

        throw UnknownError('OBAS_SCENARIO_DELETE_ERROR', { detail: error });
      }
    },
  },
};

export default resolvers;
