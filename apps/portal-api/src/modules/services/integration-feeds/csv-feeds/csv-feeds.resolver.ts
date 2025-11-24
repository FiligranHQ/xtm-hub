import { dbTx } from '../../../../../knexfile';
import {
  IntegrationFeedType,
  Resolvers,
} from '../../../../__generated__/resolvers-types';
import { DocumentId } from '../../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../../model/kanel/public/ServiceInstance';
import {
  ErrorCode,
  UnknownErrorCode,
} from '../../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../../utils/error/error.mapping';
import { AlreadyExistsError } from '../../../../utils/error/error.util';
import { extractId } from '../../../../utils/utils';
import {
  deleteDocument,
  updateDocumentWithChildren,
} from '../../document/document.domain';
import {
  CsvFeed,
  INTEGRATION_FEED_CSV_FEED_METADATA,
  OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
} from '../integration-feeds.model';
import { csvFeedsApp } from './csv-feeds.app';

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
    updateCsvFeed: async (_, input) => {
      const trx = await dbTx();
      try {
        const doc = await updateDocumentWithChildren<CsvFeed>(
          OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
          extractId<DocumentId>(input.documentId),
          {
            ...input,
            input: {
              ...input.input,
              integration_type: IntegrationFeedType.CsvFeed,
            },
          },
          INTEGRATION_FEED_CSV_FEED_METADATA,
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
};

export default resolvers;
