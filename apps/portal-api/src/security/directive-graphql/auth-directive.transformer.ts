import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';
import { AuthFn, RoleFn, ServiceFn } from './directive.model';
import { createSecureFieldResolver } from './directive.resolver';
import { AUTH_DIRECTIVE_NAME } from './validator/auth.validator';
import {
  createPlatformTokenResolver,
  PLATFORM_TOKEN_DIRECTIVE_NAME,
} from './validator/platform-token-validator';
import { SERVICE_CAPABILITY_DIRECTIVE_NAME } from './validator/service-capability.validator';
import {
  createSystemTokenResolver,
  SYSTEM_TOKEN_DIRECTIVE_NAME,
} from './validator/system-token.validator';

/**
 * Creates a schema transformer for authentication directives
 */
export const createAuthDirectiveTransformer = (
  isAuthenticatedFn: AuthFn,
  hasCapabilityFn: RoleFn,
  hasServiceCapabilityFn: ServiceFn
) => {
  const typeDirectiveArgumentMaps: Record<string, unknown> = {};

  return (schema: GraphQLSchema): GraphQLSchema => {
    return mapSchema(schema, {
      // Collect type-level directives
      [MapperKind.TYPE]: (type) => {
        const authDirective = getDirective(
          schema,
          type,
          AUTH_DIRECTIVE_NAME
        )?.[0];

        if (authDirective) {
          typeDirectiveArgumentMaps[type.name] = authDirective;
        }

        return undefined;
      },

      // Apply directives to fields
      [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
        // Get directives (field-level or inherited from type)
        const authDirective =
          getDirective(schema, fieldConfig, AUTH_DIRECTIVE_NAME)?.[0] ??
          typeDirectiveArgumentMaps[typeName];

        const serviceCapaDirective =
          getDirective(
            schema,
            fieldConfig,
            SERVICE_CAPABILITY_DIRECTIVE_NAME
          )?.[0] ?? typeDirectiveArgumentMaps[typeName];

        const systemTokenDirective =
          getDirective(schema, fieldConfig, SYSTEM_TOKEN_DIRECTIVE_NAME)?.[0] ??
          typeDirectiveArgumentMaps[typeName];

        const platformTokenDirective =
          getDirective(
            schema,
            fieldConfig,
            PLATFORM_TOKEN_DIRECTIVE_NAME
          )?.[0] ?? typeDirectiveArgumentMaps[typeName];

        // Skip if no directives
        if (
          !authDirective &&
          !serviceCapaDirective &&
          !systemTokenDirective &&
          !platformTokenDirective
        ) {
          return fieldConfig;
        }

        // Replace resolver with secure version
        const { resolve = defaultFieldResolver } = fieldConfig;
        if (systemTokenDirective) {
          fieldConfig.resolve = createSystemTokenResolver(resolve);
        } else if (platformTokenDirective) {
          fieldConfig.resolve = createPlatformTokenResolver(resolve);
        } else {
          fieldConfig.resolve = createSecureFieldResolver(resolve, {
            isAuthenticatedFn,
            hasCapabilityFn,
            hasServiceCapabilityFn,
            authDirective,
            serviceCapaDirective,
          });
        }

        return fieldConfig;
      },
    });
  };
};
