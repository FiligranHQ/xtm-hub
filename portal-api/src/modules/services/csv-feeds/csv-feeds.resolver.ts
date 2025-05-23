import { dbTx } from '../../../../knexfile';
import {
  CsvFeedConnection,
  Label,
  Resolvers,
  ServiceInstance,
} from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { UnknownError } from '../../../utils/error.util';
import { extractId } from '../../../utils/utils';
import { loadSubscription } from '../../subcription/subscription.domain';
import {
  deleteDocument,
  getChildrenDocuments,
  getLabels,
  getUploader,
  getUploaderOrganization,
  loadParentDocumentsByServiceInstance,
} from '../document/document.domain';
import {
  createFileInMinIO,
  Upload,
  waitForUploads,
} from '../document/document.helper';
import { getServiceInstance } from '../service-instance.domain';
import {
  createCsvFeed,
  CsvFeed,
  loadCsvFeedById,
  loadSeoCsvFeedBySlug,
  loadSeoCsvFeedsByServiceSlug,
} from './csv-feeds.domain';

export type CsvFeedWithResolvableFields = CsvFeed & {
  service_instance: ServiceInstance;
  labels: Label[];
};

const resolvers: Resolvers = {
  Mutation: {
    createCsvFeed: async (_, { input, document }, context) => {
      try {
        await waitForUploads(document);
        const files = await Promise.all(
          document.map((doc: Upload) => createFileInMinIO(doc, context))
        );
        return createCsvFeed(
          input,
          files,
          context
        ) as unknown as CsvFeedWithResolvableFields;
      } catch (error) {
        throw UnknownError('CSV_FEED_INSERTION_ERROR', { detail: error });
      }
    },
    deleteCsvFeed: async (_, { id }, context) => {
      const trx = await dbTx();
      try {
        const deletedDoc = await deleteDocument<CsvFeedWithResolvableFields>(
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

        throw UnknownError('CSV_FEED_DELETION_ERROR', { detail: error });
      }
    },
  },
  CsvFeed: {
    labels: ({ id }, _, context) => getLabels(context, id, { unsecured: true }),
    children_documents: ({ id }, _, context) =>
      getChildrenDocuments(context, id, { unsecured: true }),
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
    csvFeeds: async (_, input, context) =>
      loadParentDocumentsByServiceInstance<CsvFeedConnection>(context, input),
    csvFeed: async (_, { id }, context) =>
      loadCsvFeedById(context, extractId<DocumentId>(id)),
    seoCsvFeedsByServiceSlug: async (_, { serviceSlug }) =>
      loadSeoCsvFeedsByServiceSlug(serviceSlug),
    seoCsvFeedBySlug: async (_, { slug }) => loadSeoCsvFeedBySlug(slug),
  },
};

export default resolvers;
