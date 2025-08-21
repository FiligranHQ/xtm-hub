import { AppLogsCategory, logApp } from '@xtm-hub/logger';

const logResolver = {
  Mutation: {
    frontendErrorLog: (_: unknown, { message, codeStack, componentStack }) => {
      logApp.error(
        message,
        { codeStack, componentStack },
        AppLogsCategory.FRONTEND
      );
    },
  },
};

export default logResolver;
