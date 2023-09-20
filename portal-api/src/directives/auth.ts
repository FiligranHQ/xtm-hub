import {getDirective, MapperKind, mapSchema} from "@graphql-tools/utils";
import {defaultFieldResolver, GraphQLSchema} from "graphql";
import type {PortalContext, User} from "../index.js";
import {CAPABILITY_BYPASS} from "../../knexfile.js";

export const AUTH_DIRECTIVE_NAME = "authenticated";
export const ROLES_DIRECTIVE_NAME = "hasRole";

type AuthFn = (user: User) => boolean;
type RoleFn = (user: User, roleRequiredInSchema: string[]) => boolean;
const getSchemaTransformer = (isAuthenticatedFn: AuthFn, hasRoleFn: RoleFn) => {
    const typeDirectiveArgumentMaps = {};
    return {
        authDirectiveTransformer: (schema: GraphQLSchema): GraphQLSchema =>
            mapSchema(schema, {
                [MapperKind.TYPE]: type => {
                    // Save the authn info to the type fields
                    const authnDirective = getDirective(schema, type, AUTH_DIRECTIVE_NAME)?.[0];
                    if (authnDirective) {
                        typeDirectiveArgumentMaps[type.name] = authnDirective;
                    }
                    // Save the authz info to the type fields
                    const authzDirective = getDirective(schema, type, ROLES_DIRECTIVE_NAME)?.[0];
                    if (authzDirective) {
                        typeDirectiveArgumentMaps[type.name] = authzDirective;
                    }
                    return undefined;
                },
                [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
                    const authNDirective = getDirective(schema, fieldConfig, AUTH_DIRECTIVE_NAME)?.[0] ?? typeDirectiveArgumentMaps[typeName];
                    const authZDirective = getDirective(schema, fieldConfig, ROLES_DIRECTIVE_NAME)?.[0] ?? typeDirectiveArgumentMaps[typeName];
                    const {resolve = defaultFieldResolver} = fieldConfig;
                    fieldConfig.resolve = function (source, args, context: PortalContext, info) {
                        const {user} = context;
                        const requiredAuthZ = authZDirective?.requires;
                        // Check if the field requires authentication
                        if ((authNDirective || requiredAuthZ) && !isAuthenticatedFn(user)) {
                            throw new Error(`Not authenticated.`);
                        }
                        // Get the required authorization role for the requested field
                        if (requiredAuthZ && !hasRoleFn(user, requiredAuthZ)) {
                            throw new Error(`Not authorized. The provided role does not meet schema requirements`);
                        }
                        // Else, run the resolvers as normal
                        return resolve(source, args, context, info);
                    }
                    return fieldConfig;
                }
            })
    }
};

const isAuthenticated = (user: User) => {
    return !!user
};

const hasRole = (user: User, roleRequiredInSchema: string[]) => {
    const {capabilities} = user;
    const capabilityNames = capabilities.map((c) => c.name);
    if (capabilityNames.includes(CAPABILITY_BYPASS.name)) {
        return true;
    }
    return capabilityNames.some((id) => roleRequiredInSchema.includes(id));
};

export const {authDirectiveTransformer} = getSchemaTransformer(isAuthenticated, hasRole);