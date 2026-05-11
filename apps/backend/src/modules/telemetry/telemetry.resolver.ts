import { Resolvers } from '../../__generated__/resolvers-types';
import { UserId } from '../../model/kanel/public/User';
import { logApp } from '../../utils/app-logger.util';
import { telemetryApp } from './telemetry.app';

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
        await telemetryApp.sendOneClickDeployEvent({ userId, input });
        return { result: true };
      } catch (error) {
        logApp.error('Error in sendTelemetryEvent resolver', {
          error,
        });
        return {
          result: false,
          message:
            error.message ||
            'An error occurred while processing sendTelemetryEvent',
        };
      }
    },
  },
};

export default resolvers;
