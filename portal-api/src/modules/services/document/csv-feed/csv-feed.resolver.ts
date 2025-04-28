import { dbTx } from '../../../../../knexfile';
import { Resolvers } from '../../../../__generated__/resolvers-types';
import { DocumentMutator } from '../../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../../model/kanel/public/ServiceInstance';
import { logApp } from '../../../../utils/app-logger.util';
import { UnknownError } from '../../../../utils/error.util';
import { extractId } from '../../../../utils/utils';
import {
  getChildrenDocuments,
  getLabels,
  getUploader,
  getUploaderOrganization,
  loadDocuments,
} from '../document.domain';
import { createFileInMinIO, normalizeDocumentName } from '../document.helper';
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
        return loadDocuments(
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
  },
};

export default resolvers;
