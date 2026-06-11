import { Resolvers } from '../../__generated__/resolvers-types';
import { UserId } from '../../model/kanel/public/User';
import { logApp } from '../../utils/app-logger.util';
import { getErrorMessage } from '../../utils/error/error-guard.util';
import { UnknownErrorCode } from '../../utils/error/error.code';
import { TelemetryApp } from './telemetry.app';

const resolvers: Resolvers = {
  Mutation: {
    sendTelemetryEvent: () => {
      return {}; // just a placeholder object is fine
    },
  },

  SendTelemetryMutation: {
    oneClickDeploy: async (_, args, context) => {
      try {
        const { input } = args;
        const userId = context.user.id as UserId;
        await TelemetryApp.sendOneClickDeployEvent({ userId, input });
        return { result: true };
      } catch (error) {
        logApp.error('Error in sendTelemetryEvent resolver', {
          error,
        });
        const errorMessage = getErrorMessage(error);
        const isGenericErrorMessage =
          !errorMessage || errorMessage === UnknownErrorCode.UnknownError;
        const message = !isGenericErrorMessage
          ? errorMessage
          : 'An error occurred while processing sendTelemetryEvent';

        return {
          result: false,
          message,
        };
      }
    },
  },
};

export default resolvers;
