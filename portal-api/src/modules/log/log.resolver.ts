import { AppLogsCategory, logApp } from '../../utils/app-logger.util';

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
