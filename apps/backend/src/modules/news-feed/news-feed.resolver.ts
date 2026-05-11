import { Resolvers } from '../../__generated__/resolvers-types';
import { PortalContext } from '../../model/portal-context';
import {
  extractPlatformId,
  extractPlatformToken,
} from '../../security/directive-graphql/validator/platform-token-validator';
import { mapToGraphQLError } from '../../utils/error/error.mapping';
import { NewsFeedApp } from './news-feed.app';

const newsFeedResolver: Resolvers = {
  Mutation: {
    consumeProvisionedNewsFeedItems: async (_, __, context: PortalContext) => {
      try {
        const platformId = extractPlatformId(context.req);
        const token = extractPlatformToken(context.req);
        return await NewsFeedApp.consumeProvisionedNewsFeedItems({
          platformId,
          token,
        });
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
  },
};

export default newsFeedResolver;
