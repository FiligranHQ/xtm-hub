import { dbTx } from '../../../../knexfile';
import {
  ObasScenarioConnection,
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
  OBAS_SCENARIO_DOCUMENT_TYPE,
  OBAS_SCENARIO_METADATA,
  ObasScenario,
} from './obas-scenarios.domain';

const resolvers: Resolvers = {
  SeoObasScenario: {
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
  ObasScenario: {
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
    seoObasScenariosByServiceSlug: async (_, { serviceSlug }, context) => {
      const docs = await loadSeoDocumentsByServiceSlug(
        OBAS_SCENARIO_DOCUMENT_TYPE,
        serviceSlug,
        OBAS_SCENARIO_METADATA
      );
      for (const doc of docs) {
        doc.children_documents = await loadImagesByDocumentId(doc.id);
        doc.uploader = await getUploader(context, doc.id, {
          unsecured: true,
        });
        doc.labels = await getLabels(context, doc.id, {
          unsecured: true,
        });
      }
      return docs;
    },
    seoObasScenarioBySlug: async (_, { slug }) => {
      return loadSeoDocumentBySlug(
        OBAS_SCENARIO_DOCUMENT_TYPE,
        slug,
        OBAS_SCENARIO_METADATA
      );
    },
    obasScenarios: async (_, input, context) => {
      return loadParentDocumentsByServiceInstance<ObasScenarioConnection>(
        OBAS_SCENARIO_DOCUMENT_TYPE,
        context,
        input,
        OBAS_SCENARIO_METADATA
      );
    },
    obasScenario: async (_, { id }, context) =>
      loadDocumentById(
        context,
        extractId<DocumentId>(id),
        OBAS_SCENARIO_METADATA
      ),
  },
  Mutation: {
    createObasScenario: async (_, { input, document }, context) => {
      try {
        return await createDocumentWithChildren<ObasScenario>(
          OBAS_SCENARIO_DOCUMENT_TYPE,
          input,
          document,
          OBAS_SCENARIO_METADATA,
          context
        );
      } catch (error) {
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
    updateObasScenario: async (_, input, context) => {
      try {
        return await updateDocumentWithChildren<ObasScenario>(
          OBAS_SCENARIO_DOCUMENT_TYPE,
          extractId<DocumentId>(input.documentId),
          input,
          OBAS_SCENARIO_METADATA,
          context
        );
      } catch (error) {
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
    deleteObasScenario: async (_, { id }, context) => {
      const trx = await dbTx();
      try {
        const doc = await deleteDocument<ObasScenario>(
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
