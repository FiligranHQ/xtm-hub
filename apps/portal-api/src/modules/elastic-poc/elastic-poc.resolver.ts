import { Resolvers } from '../../__generated__/resolvers-types';
import { logApp } from '../../utils/app-logger.util';
import ElasticPocService from './elastic-poc.service';

const elasticPocResolver: Resolvers = {
  Mutation: {
    elasticPoc: async (_, __, context) => {
      const user = context.user;
      const selected_organization_id = context.user.selected_organization_id;
      const organization = context.user.organizations.find(
        (org) => org.id === selected_organization_id
      );

      if (!organization) {
        logApp.error('No organization found for user', { userId: user.id });
        return { result: false, message: 'No organization found for user' };
      }

      try {
        const elasticPocService = new ElasticPocService();
        const result = await elasticPocService.processBatchTelemetryEvents(
          user.id,
          organization.id,
          organization.name
        );

        return { result };
      } catch (error) {
        logApp.error('Error in elasticPoc resolver', {
          error,
          userId: user.id,
        });
        return {
          result: false,
          message:
            error.message || 'An error occurred while processing Elastic POC',
        };
      }
    },
  },
};

export default elasticPocResolver;
