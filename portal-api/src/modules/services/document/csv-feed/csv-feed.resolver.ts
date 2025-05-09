import { dbTx } from '../../../../../knexfile';
import { Resolvers } from '../../../../__generated__/resolvers-types';
import {
  DocumentId,
  DocumentMutator,
} from '../../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../../model/kanel/public/ServiceInstance';
import { logApp } from '../../../../utils/app-logger.util';
import { UnknownError } from '../../../../utils/error.util';
import { extractId } from '../../../../utils/utils';
import { loadSubscription } from '../../../subcription/subscription.domain';
import {
  getChildrenDocuments,
  getLabels,
  getUploader,
  getUploaderOrganization,
} from '../document.domain';
import { createFileInMinIO, normalizeDocumentName } from '../document.helper';
import { deleteCsvFeed, loadCsvFeeds, loadCsvFeedsBy, loadSeoCsvFeedsByServiceSlug } from './csv-feed.domain';
import { createCsvFeed } from './csv-feed.helper';

const resolvers: Resolvers = {
  Mutation: {
    createCsvFeed: async (_, input, context) => {
      const trx = await dbTx();
      try {
        const { minioName, fileName } = await createFileInMinIO(
          input.document,
          context
        );
        const addedCsvFeed = await createCsvFeed(
          input.input,
          input.document,
          minioName,
          fileName,
          context,
          trx
        );

        await trx.commit();

        return addedCsvFeed;
      } catch (error) {
        await trx.rollback();
        throw UnknownError('CSV_FEED_INSERTION_ERROR', { detail: error });
      }
    },
    deleteCsvFeed: async (_, { documentId, forceDelete }, context) => {
      const trx = await dbTx();
      try {
        const deletedCsvFeed = await deleteCsvFeed(
          context,
          extractId<DocumentId>(documentId),
          forceDelete,
          trx
        );
        await trx.commit();
        return deletedCsvFeed;
      } catch (error) {
        await trx.rollback();

        throw UnknownError('DELETE_DOCUMENT_ERROR', { detail: error });
      }
    },
  },
  CsvFeed: {
    labels: ({ id }, _, context) =>
      getLabels(context, id, {
        unsecured: true,
      }),
    children_documents: ({ id }, _, context) =>
      getChildrenDocuments(context, id, {
        unsecured: true,
      }),
    uploader: ({ id }, _, context) =>
      getUploader(context, id, {
        unsecured: true,
      }),
    uploader_organization: ({ id }, _, context) =>
      getUploaderOrganization(context, id, {
        unsecured: true,
      }),
    subscription: ({ service_instance_id }, _, context) => {
      return loadSubscription(context, service_instance_id);
    },
  },
  Query: {
    csvFeeds: async (
      _,
      {
        first,
        after,
        orderMode,
        orderBy,
        searchTerm,
        filters,
        serviceInstanceId,
      },
      context
    ) => {
      try {
        return loadCsvFeeds(
          context,
          {
            first,
            after,
            orderMode,
            orderBy,
            parentsOnly: true,
            filters,
            searchTerm: normalizeDocumentName(searchTerm ?? ''),
          },
          {
            'Document.service_instance_id':
              extractId<ServiceInstanceId>(serviceInstanceId),
          } as DocumentMutator
        );
      } catch (error) {
        logApp.error('Error while fetching csvFeeds:', error);
        throw error;
      }
    },
    csvFeed: async (_, { documentId }, context) => {
      const [parentDocument] = await loadCsvFeedsBy(context, {
        'Document.id': extractId<DocumentId>(documentId),
      } as DocumentMutator);
      return parentDocument;
    },
    seoCsvFeedsByServiceSlug: async (_, { serviceSlug }, context) => {
      console.log('AVANT OTUT');
      const csvFeeds = await loadSeoCsvFeedsByServiceSlug(serviceSlug);
      for (const csvFeed of csvFeeds) {
        // csvFeed.children_documents = await loadImagesByCustomDashboardId(
        //   csvFeed.id
        // );
        // csvFeed.uploader = await getUploader(context, csvFeed.id, {
        //   unsecured: true,
        // });
        csvFeed.labels = await getLabels(context, csvFeed.id, {
          unsecured: true,
        });
      }
      console.log('csvFeeds', csvFeeds);
      return csvFeeds;
    },
  },
};

export default resolvers;
