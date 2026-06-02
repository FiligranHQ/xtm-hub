import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';
import { AuthFn, RoleFn, ServiceFn } from './directive.model';
import { createSecureFieldResolver, ResolverFn } from './directive.resolver';
import { AUTH_DIRECTIVE_NAME } from './validator/auth.validator';
import {
  createPlatformTokenResolver,
  PLATFORM_TOKEN_DIRECTIVE_NAME,
} from './validator/platform-token-validator';
import { SERVICE_CAPABILITY_DIRECTIVE_NAME } from './validator/service-capability.validator';
import {
  createSystemTokenResolver,
  SYSTEM_TOKEN_DIRECTIVE_NAME,
  SystemTokenDirectiveArgs,
} from './validator/system-token.validator';

/**
 * Creates a schema transformer for authentication directives
 */
export const createAuthDirectiveTransformer = (
  isAuthenticatedFn: AuthFn,
  hasCapabilityFn: RoleFn,
  hasServiceCapabilityFn: ServiceFn
) => {
  const authTypeDirectiveArgumentMaps: Record<string, unknown> = {};
  const serviceCapaTypeDirectiveArgumentMaps: Record<string, unknown> = {};
  const systemTokenTypeDirectiveArgumentMaps: Record<string, unknown> = {};
  const platformTokenTypeDirectiveArgumentMaps: Record<string, unknown> = {};

  return (schema: GraphQLSchema): GraphQLSchema => {
    return mapSchema(schema, {
      // Collect type-level directives
      [MapperKind.TYPE]: (type) => {
        const authDirective = getDirective(
          schema,
          type,
          AUTH_DIRECTIVE_NAME
        )?.[0];
        const serviceCapaDirective = getDirective(
          schema,
          type,
          SERVICE_CAPABILITY_DIRECTIVE_NAME
        )?.[0];
        const systemTokenDirective = getDirective(
          schema,
          type,
          SYSTEM_TOKEN_DIRECTIVE_NAME
        )?.[0];
        const platformTokenDirective = getDirective(
          schema,
          type,
          PLATFORM_TOKEN_DIRECTIVE_NAME
        )?.[0];

        if (authDirective) {
          authTypeDirectiveArgumentMaps[type.name] = authDirective;
        }
        if (serviceCapaDirective) {
          serviceCapaTypeDirectiveArgumentMaps[type.name] =
            serviceCapaDirective;
        }
        if (systemTokenDirective) {
          systemTokenTypeDirectiveArgumentMaps[type.name] =
            systemTokenDirective;
        }
        if (platformTokenDirective) {
          platformTokenTypeDirectiveArgumentMaps[type.name] =
            platformTokenDirective;
        }

        return undefined;
      },

      // Apply directives to fields
      [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
        // Get directives (field-level or inherited from type)
        const authDirective =
          getDirective(schema, fieldConfig, AUTH_DIRECTIVE_NAME)?.[0] ??
          authTypeDirectiveArgumentMaps[typeName];

        const serviceCapaDirective =
          getDirective(
            schema,
            fieldConfig,
            SERVICE_CAPABILITY_DIRECTIVE_NAME
          )?.[0] ?? serviceCapaTypeDirectiveArgumentMaps[typeName];

        const systemTokenDirective = (getDirective(
          schema,
          fieldConfig,
          SYSTEM_TOKEN_DIRECTIVE_NAME
        )?.[0] ?? systemTokenTypeDirectiveArgumentMaps[typeName]) as
          | SystemTokenDirectiveArgs
          | undefined;

        const platformTokenDirective =
          getDirective(
            schema,
            fieldConfig,
            PLATFORM_TOKEN_DIRECTIVE_NAME
          )?.[0] ?? platformTokenTypeDirectiveArgumentMaps[typeName];

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
        const resolve = (fieldConfig.resolve ??
          defaultFieldResolver) as ResolverFn;
        if (systemTokenDirective) {
          fieldConfig.resolve = createSystemTokenResolver(
            resolve,
            systemTokenDirective
          );
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
