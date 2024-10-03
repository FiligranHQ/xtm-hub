import portalConfig from './src/config';
import pkg, { type Knex } from 'knex';
import { PageInfo } from 'graphql-relay/connection/connection';
import { applyDbSecurity } from './src/security/access';
import { PortalContext } from './src/model/portal-context';

declare module 'knex' {
  // TODO: Knex specificity, could be complicated modify the model directly
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Knex {
    interface QueryBuilder {
      asConnection<T>(): Promise<T>;
    }
  }
}

export type DatabaseType =
  | 'User'
  | 'Organization'
  | 'Service'
  | 'User_RolePortal'
  | 'RolePortal'
  | 'CapabilityPortal'
  | 'RolePortal_CapabilityPortal'
  | 'ActionTracking'
  | 'MessageTracking'
  | 'Subscription'
  | 'Service_Price'
  | 'Service_Link'
  | 'User_Service'
  | 'Service_Capability'
  | 'MalwareAnalysis'
  | 'UserService';
export type ActionType = 'add' | 'edit' | 'delete' | 'merge';

interface Pagination {
  first: number;
  after: string;
  orderMode: string;
  orderBy: string;
}

const knex = pkg;

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
    directory: portalConfig.database.seeds,
  },
  postProcessResponse: (result, queryContext) => {
    if (!queryContext?.__typename) return result;
    const __typename = queryContext.__typename;
    if (Array.isArray(result)) {
      return result.map((row) => ({ ...row, __typename }));
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

export const dbRaw = (
  statement: string,
  binding?: Knex.RawBinding | Knex.RawBinding[]
) => database.raw(statement, binding);

export const dbTx = () => database.transaction();

export const db = <T>(
  context: PortalContext,
  type: DatabaseType,
  opts: QueryOpts = {}
) => {
  const queryContext = database<T>(type).queryContext({ __typename: type });
  return applyDbSecurity<T>(context, type, queryContext, opts);
};

export const dbUnsecure = <T>(type: DatabaseType) => {
  const context = { user: null, req: null, res: null };
  return db<T>(context, type, { unsecured: true });
};

export const dbConnections = <T>(
  nodes: T[],
  offset: string | undefined,
  limit: number
) => {
  const currentOffset = offset ? Number(atob(offset)) : 0;
  const edges: { cursor: string; node: T }[] = nodes.map((n, index) => {
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

export const paginate = <T>(
  context: PortalContext,
  type: DatabaseType,
  pagination: Pagination,
  opts: QueryOpts = {}
) => {
  const { first, after, orderMode, orderBy } = pagination;
  const currentOffset = after ? Number(atob(after)) : 0;
  const queryContext = db<T>(context, type, opts);
  queryContext.queryContext({
    ...queryContext.queryContext(),
    ...pagination,
    connection: true,
  });
  queryContext
    .orderBy([{ column: orderBy, order: orderMode }])
    .offset(currentOffset)
    .limit(first);
  queryContext.asConnection = <U>() =>
    queryContext.then((rows) => {
      return dbConnections(rows, after, first);
    }) as U;
  return queryContext;
};

export const dbMigration = {
  migrate: () => database.migrate.latest(),
  version: () => database.migrate.currentVersion(),
  seed: () => database.seed.run()
};

export default config;
