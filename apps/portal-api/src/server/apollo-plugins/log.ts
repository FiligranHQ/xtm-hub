import { ApolloServerPlugin, BaseContext } from '@apollo/server';
import type { Request, Response } from 'express';
import type { UserLoadUserBy } from '../../model/user';
import { AppLogsCategory, logApp } from '../../utils/app-logger.util';

export interface Context extends BaseContext {
  user: UserLoadUserBy;
  req: Request;
  res: Response;
  serviceId?: string;
}

export const errorLoggingPlugin = (): ApolloServerPlugin<Context> => ({
  async requestDidStart(requestContext) {
    const { request, contextValue } = requestContext;
    const { user, serviceId, req } = contextValue ?? {};

    logApp.info(
      'GraphQL request received',
      {
        operationName: request.operationName,
        query: request.query,
        variables: req?.body?.variables,
        user,
        serviceId,
      },
      AppLogsCategory.GRAPHQL
    );

    return {
      async didEncounterErrors(requestContext) {
        const { errors, operationName, contextValue } = requestContext;

        errors.forEach((error) => {
          logApp.error(
            error.message,
            {
              path: error.path,
              locations: error.locations,
              operationName,
              user: contextValue?.user,
              serviceId: contextValue?.serviceId,
              codeStack: error.originalError?.stack,
              variables: contextValue?.req?.body?.variables,
            },
            AppLogsCategory.GRAPHQL
          );
        });
      },
    };
  },
});
