import { dbTx } from '../../../../knexfile';
import {
  CsvFeedConnection,
  Resolvers,
} from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { ErrorCode, UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { AlreadyExistsError } from '../../../utils/error/error.util';
import { extractId } from '../../../utils/utils';
import { subscriptionApp } from '../../subcription/subscription.app';
import {
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
import { csvFeedsApp } from './csv-feeds.app';
import {
  CSV_FEED_DOCUMENT_TYPE,
  CSV_FEED_METADATA,
  CsvFeed,
} from './csv-feeds.domain';

const resolvers: Resolvers = {
  Mutation: {
    createCsvFeed: async (_, { input, document }, context) => {
      try {
        return await csvFeedsApp.createCsvFeed(context, input, document);
      } catch (error) {
        if (error.message?.includes('document_type_slug_unique')) {
          throw AlreadyExistsError(ErrorCode.CsvFeedUniqueSlugError, {
            detail: error,
          });
        }

        throw mapToGraphQLError(error, UnknownErrorCode.CsvFeedInsertionError);
      }
    },
    updateCsvFeed: async (_, input, context) => {
      const trx = await dbTx();
      try {
        const doc = await updateDocumentWithChildren<CsvFeed>(
          'csv_feed',
          extractId<DocumentId>(input.documentId),
          input,
          CSV_FEED_METADATA,
          context,
          trx
        );
        await trx.commit();
        return doc;
      } catch (error) {
        await trx.rollback();
        if (error.message?.includes('document_type_slug_unique')) {
          throw AlreadyExistsError(ErrorCode.CsvFeedUniqueSlugError, {
            detail: error,
          });
        }

        throw mapToGraphQLError(error, UnknownErrorCode.CsvFeedUpdateError);
      }
    },
    deleteCsvFeed: async (_, { id }, context) => {
      const trx = await dbTx();
      try {
        const deletedDoc = await deleteDocument<CsvFeed>(
          context,
          extractId<DocumentId>(id),
          context.serviceInstanceId as ServiceInstanceId,
          true,
          trx
        );
        await trx.commit();
        return deletedDoc;
      } catch (error) {
        await trx.rollback();

        throw mapToGraphQLError(error, UnknownErrorCode.CsvFeedDeletionError);
      }
    },
  },
  CsvFeed: {
    labels: ({ id }, _, context) => getLabels(context, id, { unsecured: true }),
    children_documents: ({ id }) => loadImagesByDocumentId(id),
    uploader: ({ id }, _, context) =>
      getUploader(context, id, { unsecured: true }),
    uploader_organization: ({ id }, _, context) =>
      getUploaderOrganization(context, id, { unsecured: true }),
    service_instance: ({ service_instance_id }, _, context) =>
      getServiceInstance(context, service_instance_id),
    subscription: ({ service_instance_id }, _, context) =>
      subscriptionApp.loadSubscriptionModel(context, service_instance_id),
  },
  Query: {
    csvFeeds: async (_, input, context) =>
      loadParentDocumentsByServiceInstance<CsvFeedConnection>(
        'csv_feed',
        context,
        input
      ),
    csvFeed: async (_, { id }, context) =>
      loadDocumentById(context, extractId<DocumentId>(id)),
    seoCsvFeedsByServiceSlug: async (_, { serviceSlug }) =>
      loadSeoDocumentsByServiceSlug(
        CSV_FEED_DOCUMENT_TYPE,
        serviceSlug,
        CSV_FEED_METADATA
      ),
    seoCsvFeedBySlug: async (_, { slug }) =>
      loadSeoDocumentBySlug(CSV_FEED_DOCUMENT_TYPE, slug, CSV_FEED_METADATA),
  },
};

export default resolvers;
