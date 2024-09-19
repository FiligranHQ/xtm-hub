import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';
import { User } from '../model/user';
import { PortalContext } from '../model/portal-context';
import { getCapabilityUser, userHasBypassCapability } from './auth.helper';

export const AUTH_DIRECTIVE_NAME = 'auth';
export const SERVICE_DIRECTIVE_NAME = 'service_capa';

export type ServiceCapabilityArgs = {
  service_id?: string;
  subscription_id?: string;
};

type AuthFn = (user: User) => boolean;
type RoleFn = (user: User, roleRequiredInSchema: string[]) => boolean;
type ServiceFn = (
  user: User,
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
            const capabilitiesRequired = authDirective?.requires;
            const serviceCapabilitiesRequired = serviceCapaDirective?.requires;
            // Check if the field requires authentication
            if (authDirective && !isAuthenticatedFn(user)) {
              throw new Error(`Not authenticated.`);
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

const isAuthenticated = (user: User) => {
  return !!user;
};

const hasCapability = (user: User, capabilitiesRequired: string[]) => {
  if (userHasBypassCapability(user)) {
    return true;
  }
  const { capabilities } = user;
  const capabilityNames = capabilities.map((c) => c.name);
  return capabilityNames.length > 0 && capabilitiesRequired.length === 0
    ? true
    : capabilityNames.some((name) => capabilitiesRequired.includes(name));
};

const hasServiceCapability = async (
  user: User,
  args: ServiceCapabilityArgs,
  capabilitiesRequired: string[]
) => {
  if (userHasBypassCapability(user)) {
    return true;
  }

  if (!args.service_id && !args.subscription_id) {
    throw new Error(
      `Service_id or subscription_id is undefined, please provide one of them to use this directive`
    );
  }

  return await getCapabilityUser(user, args).then(
    (capabilityUser) =>
      capabilityUser?.capabilities?.some((capability) =>
        capabilitiesRequired.includes(capability)
      ) ?? false
  );
};

export const { authDirectiveTransformer } = getSchemaTransformer(
  isAuthenticated,
  hasCapability,
  hasServiceCapability
);
