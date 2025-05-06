import {
  CsvFeedConnection,
  Resolvers,
} from '../../../__generated__/resolvers-types';
import { UnknownError } from '../../../utils/error.util';
import { loadSubscription } from '../../subcription/subscription.domain';
import {
  getChildrenDocuments,
  getLabels,
  getUploader,
  getUploaderOrganization,
  loadParentDocumentsByServiceInstance,
} from '../document/document.domain';
import { createFileInMinIO, waitForUploads } from '../document/document.helper';
import { createCsvFeed } from './csv-feeds.domain';

const resolvers: Resolvers = {
  Mutation: {
    createCsvFeed: async (_, input, context) => {
      try {
        await waitForUploads(input.document);
        const document = await createFileInMinIO(input.document, context);
        return createCsvFeed(input.input, document, context);
      } catch (error) {
        throw UnknownError('CSV_FEED_INSERTION_ERROR', { detail: error });
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
    subscription: ({ service_instance_id }, _, context) =>
      loadSubscription(context, service_instance_id),
  },
  Query: {
    csvFeeds: async (_, input, context) => {
      return loadParentDocumentsByServiceInstance<CsvFeedConnection>(
        context,
        input
      );
    },
  },
};

export default resolvers;
