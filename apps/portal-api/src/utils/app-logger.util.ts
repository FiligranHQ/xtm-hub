import config from 'config';
import { GraphQLError } from 'graphql';
import { createLogger, format, QueryOptions, transports } from 'winston';
import pjson from '../../package.json';
import User from '../model/kanel/public/User';
import { UnknownError } from './error/error.util';
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
  LOGIN_PROVIDER = 'LOGIN_PROVIDER',
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

/**
 * Detects the type of non-serializable value
 */
const detectValueType = (value: unknown): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'function') return 'function';
  if (typeof value === 'symbol') return 'symbol';
  if (typeof value === 'bigint') return 'bigint';
  if (value instanceof Error) return 'Error';
  if (value instanceof Date) return 'Date';
  if (value instanceof RegExp) return 'RegExp';
  if (Array.isArray(value)) return 'Array';
  if (typeof value === 'object') {
    const constructor = value.constructor?.name;
    return constructor || 'Object';
  }
  return typeof value;
};

/**
 * Tries to find circular references in an object
 */
const findCircularReferences = (
  obj: object,
  path = 'root',
  seen = new WeakSet()
): string[] => {
  const circular: string[] = [];

  if (obj === null || typeof obj !== 'object') {
    return circular;
  }

  if (seen.has(obj)) {
    circular.push(path);
    return circular;
  }

  seen.add(obj);

  try {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (value && typeof value === 'object') {
        circular.push(...findCircularReferences(value, `${path}.${key}`, seen));
      }
    });
  } catch (_) {
    // Ignore errors when accessing keys
  }

  return circular;
};

/**
 * Sanitizes attributes to ensure they're JSON-safe for Grafana/Loki
 */
const sanitizeAttributes = (
  attributesRaw: Record<string, unknown>,
  context: string = 'unknown'
): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};
  const serializationIssues: Array<{
    key: string;
    type: string;
    reason: string;
  }> = [];

  Object.keys(attributesRaw).forEach((key) => {
    const value = attributesRaw[key];
    const valueType = detectValueType(value);

    // Skip functions and symbols
    if (typeof value === 'function') {
      serializationIssues.push({
        key,
        type: 'function',
        reason: 'Functions cannot be serialized',
      });
      sanitized[key] = '[Function]';
      return;
    }

    if (typeof value === 'symbol') {
      serializationIssues.push({
        key,
        type: 'symbol',
        reason: 'Symbols cannot be serialized',
      });
      sanitized[key] = '[Symbol]';
      return;
    }

    // Handle simple types
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null
    ) {
      sanitized[key] = value;
    } else if (typeof value === 'undefined') {
      serializationIssues.push({
        key,
        type: 'undefined',
        reason: 'Undefined values are omitted in JSON',
      });
      sanitized[key] = null;
    } else if (typeof value === 'bigint') {
      serializationIssues.push({
        key,
        type: 'bigint',
        reason: 'BigInt converted to string',
      });
      sanitized[key] = value.toString();
    } else {
      // For objects/arrays, check for circular references and stringify
      try {
        // Check for circular references
        const circularPaths = findCircularReferences(value as object, key);
        if (circularPaths.length > 0) {
          serializationIssues.push({
            key,
            type: valueType,
            reason: `Circular reference detected at: ${circularPaths.join(', ')}`,
          });
          sanitized[key] = '[Circular Reference]';
          return;
        }

        const stringified = JSON.stringify(value);

        // Verify it can be parsed back
        JSON.parse(stringified);

        // Check size (warn if > 10KB)
        if (stringified.length > 10000) {
          serializationIssues.push({
            key,
            type: valueType,
            reason: `Large object (${stringified.length} chars), may hit Loki limits`,
          });
        }

        sanitized[key] = stringified;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        serializationIssues.push({
          key,
          type: valueType,
          reason: `Serialization failed: ${errorMessage}`,
        });
        sanitized[key] = `[Unserializable ${valueType}]`;

        // Log the problematic value structure
        console.error(
          `[SERIALIZATION ERROR] Context: ${context}, Key: ${key}, Type: ${valueType}`
        );
        console.error(
          'Value keys:',
          value && typeof value === 'object' ? Object.keys(value) : 'N/A'
        );
        console.error('Error:', errorMessage);
      }
    }
  });

  // Log all serialization issues
  if (serializationIssues.length > 0) {
    console.warn(`[SERIALIZATION ISSUES] Context: ${context}`);
    serializationIssues.forEach((issue) => {
      console.warn(
        `  - Key: "${issue.key}", Type: ${issue.type}, Reason: ${issue.reason}`
      );
    });
  }

  return sanitized;
};

const buildMetaErrors = (error: Error) => {
  const errors = [];

  if (error instanceof GraphQLError) {
    const extensions = error.extensions ?? {};
    const extensionsData = (extensions.data ?? {}) as Record<string, unknown>;
    const attributesRaw = omit(extensionsData, ['cause']);

    const baseError = {
      name: extensions.code ?? error.name,
      message: error.message,
      // Truncate stack trace to avoid Loki line limits
      stack:
        appLogsConfig.extended_error_message && error.stack
          ? error.stack.substring(0, 3000)
          : undefined,
      // Sanitize attributes for JSON safety
      attributes:
        Object.keys(attributesRaw).length > 0
          ? sanitizeAttributes(
              attributesRaw,
              `GraphQLError:${extensions.code ?? error.name}`
            )
          : undefined,
    };

    errors.push(baseError);

    if (extensionsData.cause && extensionsData.cause instanceof Error) {
      errors.push(...buildMetaErrors(extensionsData.cause));
    }
  } else if (error instanceof Error) {
    const baseError = {
      name: error.name,
      message: error.message,
      // Truncate stack trace to avoid Loki line limits
      stack:
        appLogsConfig.extended_error_message && error.stack
          ? error.stack.substring(0, 3000)
          : undefined,
    };
    errors.push(baseError);
  }

  return errors;
};

const addBasicMetaInformation = (
  category: AppLogsCategory,
  error: Error,
  meta: Record<string, unknown> & { user?: User }
) => {
  const logMeta: Record<string, unknown> = {
    ...omit(meta, ['user']),
    // Use user_id to match your Grafana query
    user_id: meta.user?.id,
  };

  if (error) {
    const errorsArray = buildMetaErrors(error);

    if (errorsArray.length > 0) {
      const firstError = errorsArray[0];

      // Add top-level fields for easy querying in Grafana
      logMeta.error_name = firstError.name;
      logMeta.error_message = firstError.message;

      if (firstError.stack) {
        logMeta.error_stack = firstError.stack;
      }

      // Stringify attributes for Grafana compatibility
      if (
        firstError.attributes &&
        Object.keys(firstError.attributes).length > 0
      ) {
        try {
          const stringified = JSON.stringify(firstError.attributes);
          logMeta.error_attributes = stringified;

          // Verify it can be parsed back
          JSON.parse(stringified);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.error(
            `[LOGGER] Failed to serialize error_attributes: ${errorMsg}`
          );
          console.error(
            '[LOGGER] Attributes keys:',
            Object.keys(firstError.attributes)
          );
          logMeta.error_attributes = '[Serialization failed]';
          logMeta.error_attributes_error = errorMsg;
        }
      }

      // Keep full errors array as stringified JSON for detailed debugging
      try {
        const stringified = JSON.stringify(errorsArray);
        logMeta.errors_detail = stringified;

        // Verify it can be parsed back
        JSON.parse(stringified);

        // Warn if very large
        if (stringified.length > 50000) {
          console.warn(
            `[LOGGER] Large errors_detail: ${stringified.length} chars, may hit Loki limits (256KB)`
          );
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(
          `[LOGGER] Failed to serialize errors_detail: ${errorMsg}`
        );
        logMeta.errors_detail = '[Serialization failed]';
        logMeta.errors_detail_error = errorMsg;
      }
    }
  }

  // Final validation: try to serialize the entire log meta
  try {
    const finalJson = JSON.stringify({
      category,
      version: pjson.version,
      ...logMeta,
    });
    JSON.parse(finalJson);

    if (finalJson.length > 200000) {
      console.warn(
        `[LOGGER] Very large log entry: ${finalJson.length} chars, may hit Loki limits (256KB)`
      );
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(
      `[LOGGER] CRITICAL: Final log meta cannot be serialized: ${errorMsg}`
    );
    console.error('[LOGGER] Log meta keys:', Object.keys(logMeta));

    // Add error info to the log itself
    logMeta.serialization_error = errorMsg;
    logMeta.serialization_failed = true;
  }

  return { category, version: pjson.version, ...logMeta };
};

export const appLogger = createLogger({
  level: appLogsConfig.logs_level,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: appLogsConfig.extended_error_message }),
    process.env.LOCAL_DEV === 'true'
      ? format.combine(
          format.colorize({ all: true }),
          format.align(),
          format.simple()
        )
      : format.json({
          // Add replacer to handle edge cases
          replacer: (_, value) => {
            // Handle circular references (shouldn't happen now, but safety)
            if (value instanceof Error) {
              return {
                name: value.name,
                message: value.message,
                stack: value.stack,
              };
            }
            return value;
          },
        })
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
    if (process.env.LOCAL_DEV === 'true' && meta.codeStack) {
      console.error('Original error:');
      console.error(meta.codeStack);
    } else {
      appLogger.log(
        level,
        message,
        addBasicMetaInformation(category, error, {
          ...meta,
          source: 'backend',
        })
      );
    }
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
