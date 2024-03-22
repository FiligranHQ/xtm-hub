import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';
import { CAPABILITY_BYPASS } from '../../knexfile';
import { User } from '../model/user';
import { PortalContext } from '../model/portal-context';

export const AUTH_DIRECTIVE_NAME = 'auth';

type AuthFn = (user: User) => boolean;
type RoleFn = (user: User, roleRequiredInSchema: string[]) => boolean;
const getSchemaTransformer = (isAuthenticatedFn: AuthFn, hasRoleFn: RoleFn) => {
  const typeDirectiveArgumentMaps = {};
  return {
    authDirectiveTransformer: (schema: GraphQLSchema): GraphQLSchema =>
      mapSchema(schema, {
        [MapperKind.TYPE]: type => {
          const authDirective = getDirective(schema, type, AUTH_DIRECTIVE_NAME)?.[0];
          if (authDirective) {
            typeDirectiveArgumentMaps[type.name] = authDirective;
          }
          return undefined;
        },
        [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
          const authDirective = getDirective(schema, fieldConfig, AUTH_DIRECTIVE_NAME)?.[0] ?? typeDirectiveArgumentMaps[typeName];
          const { resolve = defaultFieldResolver } = fieldConfig;
          fieldConfig.resolve = function(source, args, context: PortalContext, info) {
            const { user } = context;
            const rolesRequired = authDirective?.requires;
            // Check if the field requires authentication
            if (authDirective && !isAuthenticatedFn(user)) {
              throw new Error(`Not authenticated.`);
            }
            // Get the required authorization role for the requested field
            if (authDirective && !hasRoleFn(user, rolesRequired)) {
              throw new Error(`Not authorized. The provided role does not meet schema requirements`);
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

const hasRole = (user: User, rolesRequired: string[]) => {
  const { capabilities } = user;
  const capabilityNames = capabilities.map((c) => c.name);
  if (capabilityNames.includes(CAPABILITY_BYPASS.name)) {
    return true;
  }
  return capabilityNames.some((id) => rolesRequired.includes(id));
};

export const { authDirectiveTransformer } = getSchemaTransformer(isAuthenticated, hasRole);
