import { dbTx } from '../../../../../knexfile';
import { Resolvers } from '../../../../__generated__/resolvers-types';
import { UnknownError } from '../../../../utils/error.util';
import { addJsonInMinIO, createCsvFeed } from './csv-feed.helper';

const resolvers: Resolvers = {
  Mutation: {
    addCsvFeed: async (_, input, context) => {
      const trx = await dbTx();
      try {
        const { minioName, fileName } = await addJsonInMinIO(
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
};

export default resolvers;
