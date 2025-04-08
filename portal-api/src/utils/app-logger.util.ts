import config from 'config';
import { GraphQLError } from 'graphql';
import { createLogger, format, QueryOptions, transports } from 'winston';
import pjson from '../../package.json';
import { UnknownError } from './error.util';
import { omit } from './utils';

/**
 *  Log levels
 */
export type AppLogsLevel = 'info' | 'error' | 'warn' | 'debug';

/**
 * Log categories
 */
export enum AppLogsCategory {
  BACKEND = 'BACKEND',
  GRAPHQL = 'BACKEND_GRAPHQL',
  FRONTEND = 'FRONTEND',
}

/*
 * Defines the configuration for the application logs
 */
export interface AppLogsConfig {
  /*
   * The log level used by the application
   *
   * @default 'info'
   */
  logs_level: AppLogsLevel;

  /*
   * Whether to include the error stack trace in the logs
   *
   * @default true
   */
  extended_error_message: boolean;
}

const appLogsConfig = config.get<AppLogsConfig>('app_logs');

const buildMetaErrors = (error: Error) => {
  const errors = [];
  if (error instanceof GraphQLError) {
    const extensions = error.extensions ?? {};
    const extensionsData = (extensions.data ?? {}) as Record<string, unknown>;
    const attributes = omit(extensionsData, ['cause']);
    const baseError = {
      name: extensions.code ?? error.name,
      message: error.message,
      stack: error.stack,
      attributes,
    };
    errors.push(baseError);
    if (extensionsData.cause && extensionsData.cause instanceof Error) {
      errors.push(...buildMetaErrors(extensionsData.cause));
    }
  } else if (error instanceof Error) {
    const baseError = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
    errors.push(baseError);
  }
  return errors;
};

const addBasicMetaInformation = (
  category: AppLogsCategory,
  error: Error,
  meta: Record<string, unknown>
) => {
  const logMeta = { ...meta };
  if (error) logMeta.errors = buildMetaErrors(error);
  return { category, version: pjson.version, ...logMeta };
};

export const appLogger = createLogger({
  level: appLogsConfig.logs_level,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: appLogsConfig.extended_error_message }),
    config.get('environment') !== 'development'
      ? format.json()
      : format.combine(format.colorize(), format.prettyPrint())
  ),
  transports: [new transports.Console()],
});

export const logApp = {
  _log: (
    level: AppLogsLevel,
    message: string,
    error: Error,
    meta: Record<string, unknown> = {},
    category: AppLogsCategory = AppLogsCategory.BACKEND
  ) => {
    appLogger.log(
      level,
      message,
      addBasicMetaInformation(category, error, {
        ...meta,
        source: 'backend',
      })
    );
  },
  _logWithError: (
    level: AppLogsLevel,
    messageOrError: string | Error,
    meta: Record<string, unknown> = {},
    category: AppLogsCategory = AppLogsCategory.BACKEND
  ) => {
    const isError = messageOrError instanceof Error;
    const message = isError ? messageOrError.message : messageOrError;
    let error = null;
    if (isError) {
      if (messageOrError instanceof GraphQLError) {
        error = messageOrError;
      } else {
        error = UnknownError(message, { cause: messageOrError });
      }
    }
    logApp._log(level, message, error, meta, category);
  },
  debug: (message: string, meta: Record<string, unknown> = {}) =>
    logApp._log('debug', message, null, meta),
  info: (message: string, meta: Record<string, unknown> = {}) =>
    logApp._log('info', message, null, meta),
  warn: (messageOrError: string | Error, meta: Record<string, unknown> = {}) =>
    logApp._logWithError('warn', messageOrError, meta),
  error: (
    messageOrError: string | Error,
    meta: Record<string, unknown> = {},
    category: AppLogsCategory = AppLogsCategory.BACKEND
  ) => logApp._logWithError('error', messageOrError, meta, category),
  query: (
    options: QueryOptions,
    errCallback: (error: Error, results: unknown) => void
  ) => appLogger.query(options, errCallback),
};
