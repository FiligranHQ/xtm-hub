import portalConfig from './src/config.js';
import pkg, { Knex } from 'knex';
import { PageInfo } from 'graphql-relay/connection/connection.js';
import { applyDbSecurity } from './src/security/access.js';
import { Capability, Restriction } from './src/__generated__/resolvers-types.js';
import { PortalContext } from './src/model/portal-context.js';
import { Role } from './src/model/role.js';

export const CAPABILITY_BYPASS: Capability = { id: '85c9fe6f-901f-4992-a8aa-b8d56a7e2e09', name: Restriction.Bypass };
export const CAPABILITY_ADMIN: Capability = { id: 'e0e32277-6530-49aa-9df6-22211f2651ff', name: Restriction.Admin };
export const ROLE_ADMIN: Role = { id: '6b632cf2-9105-46ec-a463-ad59ab58c770', name: 'ADMIN' };
export const ROLE_USER: Role = { id: '40cfe630-c272-42f9-8fcf-f219e2f4277b', name: 'USER' };

export type DatabaseType =
  'User'
  |'Organization'
  |'Service'
  |'User_RolePortal'
  |'RolePortal'
  |'CapabilityPortal'
  |'RolePortal_CapabilityPortal'
export type ActionType = 'add'|'edit'|'delete'|'merge'

interface Pagination {
  first: number;
  after: string;
  orderMode: string;
  orderBy: string;
}

const { knex } = pkg;

const config: Knex.Config = {
  client: 'pg',
  connection: {
    host: portalConfig.database.host,
    port: portalConfig.database.port,
    user: portalConfig.database.user,
    password: portalConfig.database.password,
    database: portalConfig.database.database,
  },
  migrations: {
    extension: 'js',
    tableName: 'migrations',
    directory: 'src/migrations',
  },
  seeds: {
    extension: 'js',
    directory: 'src/seeds',
  },
  postProcessResponse: (result, queryContext) => {
    if (!queryContext?.__typename) return result;
    const __typename = queryContext.__typename;
    if (Array.isArray(result)) {
      return result.map(row => ({ ...row, __typename }));
    } else if (result && Object.keys(result).length > 0) {
      return { ...result, __typename };
    }
    // Nothing found
    return undefined;
  },
};

const database = knex(config);

export interface QueryOpts {
  unsecured?: boolean;
}

export const dbRaw = (statement: string) => database.raw(statement);

export const dbTx = () => database.transaction();

export const db = <T>(context: PortalContext, type: DatabaseType, opts: QueryOpts = {}) => {
  const queryContext = database<T>(type).queryContext({ __typename: type });
  return applyDbSecurity<T>(context, type, queryContext, opts);
};

export const dbUnsecure = <T>(type: DatabaseType) => {
  const context = { user: null, req: null, res: null };
  return db<T>(context, type, { unsecured: true });
};

export const dbConnections = <T>(nodes: T[], offset: string|undefined, limit: number) => {
  const currentOffset = offset ? Number(atob(offset)) : 0;
  const edges: { cursor: string, node: T }[] = nodes.map((n, index) => {
    const nextIndex = index + 1;
    return {
      cursor: btoa(String(currentOffset + nextIndex)),
      node: n,
    };
  });
  const pageInfo: PageInfo = {
    startCursor: edges[0]?.cursor,
    endCursor: edges.slice(-1)[0]?.cursor,
    hasNextPage: nodes.length >= limit,
    hasPreviousPage: !offset && nodes.length > 0,
  };
  return { edges, pageInfo };
};

export const paginate = <T>(context: PortalContext, type: DatabaseType, pagination: Pagination, opts: QueryOpts = {}) => {
  const { first, after, orderMode, orderBy } = pagination;
  const currentOffset = after ? Number(atob(after)) : 0;
  const queryContext = db<T>(context, type, opts);
  queryContext.queryContext({ ...queryContext.queryContext(), ...pagination, connection: true });
  queryContext.orderBy([{ column: orderBy, order: orderMode }]).offset(currentOffset).limit(first);
  queryContext.asConnection = <U>() => queryContext.then(rows => dbConnections(rows, after, first)) as U;
  return queryContext;
};

export const dbMigration = {
  migrate: () => database.migrate.latest(),
  version: () => database.migrate.currentVersion(),
};

export default config;
