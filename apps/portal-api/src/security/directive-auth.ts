import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';
import { PortalContext } from '../model/portal-context';
import { getCapabilityUser, userHasBypassCapability } from './auth.helper';

import { UserLoadUserBy } from '../model/user';
import { getCapabilities } from '../modules/users/users.domain';
import { logApp } from '../utils/app-logger.util';

export const AUTH_DIRECTIVE_NAME = 'auth';
export const SERVICE_DIRECTIVE_NAME = 'service_capa';

export type ServiceCapabilityArgs = {
  service_instance_id?: string;
  subscription_id?: string;
  serviceInstanceId?: string;
};

type AuthFn = (user: UserLoadUserBy) => boolean;
type RoleFn = (user: UserLoadUserBy, roleRequiredInSchema: string[]) => boolean;
type ServiceFn = (
  user: UserLoadUserBy,
  args: ServiceCapabilityArgs,
  roleRequiredInSchema: string[]
) => Promise<boolean>;
const getSchemaTransformer = (
  isAuthenticatedFn: AuthFn,
  hasCapabilityFn: RoleFn,
  hasServiceCapabilityFn: ServiceFn
) => {
  const typeDirectiveArgumentMaps = {};
  return {
    authDirectiveTransformer: (schema: GraphQLSchema): GraphQLSchema =>
      mapSchema(schema, {
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
        [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
          const authDirective =
            getDirective(schema, fieldConfig, AUTH_DIRECTIVE_NAME)?.[0] ??
            typeDirectiveArgumentMaps[typeName];
          const serviceCapaDirective =
            getDirective(schema, fieldConfig, SERVICE_DIRECTIVE_NAME)?.[0] ??
            typeDirectiveArgumentMaps[typeName];
          const { resolve = defaultFieldResolver } = fieldConfig;
          fieldConfig.resolve = async function (
            source,
            args,
            context: PortalContext,
            info
          ) {
            const { user } = context;
            if (user && !user.capabilities) {
              const capabilities = await getCapabilities(undefined, user.id, {
                unsecured: true,
              });
              user.capabilities = capabilities;
            }
            const capabilitiesRequired = authDirective?.requires;
            const serviceCapabilitiesRequired = serviceCapaDirective?.requires;
            // Check if the field requires authentication
            if (authDirective && !isAuthenticatedFn(user)) {
              logApp.warn('Not authenticated.');
              return;
            }
            // Get the required authorization role for the requested field
            if (authDirective && !hasCapabilityFn(user, capabilitiesRequired)) {
              throw new Error(
                `Not authorized. The provided role does not meet schema requirements`
              );
            }
            if (serviceCapaDirective) {
              const hasCapability = await hasServiceCapabilityFn(
                user,
                args,
                serviceCapabilitiesRequired
              );
              if (!hasCapability) {
                throw new Error(
                  `Not authorized. You don't have any access on this service`
                );
              }
            }
            // Else, run the resolvers as normal
            return resolve(source, args, context, info);
          };
          return fieldConfig;
        },
      }),
  };
};

const isAuthenticated = (user: UserLoadUserBy) => {
  return !!user;
};

const hasCapability = (
  user: UserLoadUserBy,
  capabilitiesRequired: string[]
) => {
  if (userHasBypassCapability(user)) {
    return true;
  }

  // Authorize if the user is connected and no need specific capabilities
  if (!user.disabled && capabilitiesRequired.length === 0) {
    return true;
  }

  return user.selected_org_capabilities.some((name) =>
    capabilitiesRequired.includes(name)
  );
};

const hasServiceCapability = async (
  user: UserLoadUserBy,
  args: ServiceCapabilityArgs,
  capabilitiesRequired: string[]
) => {
  if (userHasBypassCapability(user)) {
    return true;
  }

  if (
    !args.serviceInstanceId &&
    !args.service_instance_id &&
    !args.subscription_id
  ) {
    throw new Error(
      `serviceInstanceId or service_instance_id or subscription_id is undefined, please provide one of them to use this directive`
    );
  }
  const mapArgs = args.serviceInstanceId
    ? { service_instance_id: args.serviceInstanceId }
    : args;

  return await getCapabilityUser(user, mapArgs).then(
    (capabilityUser) =>
      capabilityUser?.capabilities?.some((capability) =>
        capabilitiesRequired.includes(capability)
      ) ?? false
  );
};

export const authDirectives = {
  hasCapability,
  hasServiceCapability,
};

export const { authDirectiveTransformer } = getSchemaTransformer(
  isAuthenticated,
  hasCapability,
  hasServiceCapability
);
