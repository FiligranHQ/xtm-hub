import { type PageInfo } from 'graphql-relay/connection/connection';
import pkg, { type Knex } from 'knex';
import { Filter, FilterKey } from './src/__generated__/resolvers-types';
import portalConfig from './src/config';
import { PortalContext } from './src/model/portal-context';
import { applyDbSecurity } from './src/security/access';
import { extractId } from './src/utils/utils';

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
  | 'ServiceInstance'
  | 'ServiceDefinition'
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
  | 'Generic_Service_Capability'
  | 'Service_Capability'
  | 'Subscription_Capability'
  | 'UserService_Capability'
  | 'MalwareAnalysis'
  | 'UserService'
  | 'Document'
  | 'User_Organization'
  | 'Label'
  | 'Object_Label'
  | 'UserOrganization_Capability';
export type ActionType = 'add' | 'edit' | 'delete' | 'merge';

interface Pagination {
  first?: number;
  after?: string;
  orderMode?: string;
  orderBy?: string;
  filters?: Filter[];
  searchTerm?: string;
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

export const database = knex(config);

export interface QueryOpts {
  unsecured?: boolean;
  first?: number;
  after?: string;
  orderMode?: string;
  orderBy?: string;
  queryType?: 'select' | 'insert' | 'update' | 'delete';
  capabilities?: string[];
  searchTerm?: string;
  filters?: Filter[];
  columns?: string[];
}

export const dbRaw = (
  statement: string,
  binding?: Knex.RawBinding | Knex.RawBinding[]
) => database.raw(statement, binding);

export const dbTx = () => database.transaction();

export const db = <T>(
  context: PortalContext,
  type: DatabaseType,
  opts: Partial<QueryOpts> = {}
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
  limit: number,
  totalCount
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
  return { edges, pageInfo, totalCount };
};

const searchAttributes = [
  'name',
  'file_name',
  'description',
  'short_description',
  'email',
  'first_name',
  'last_name',
];

export const paginate = async <T, U>(
  context: PortalContext,
  type: DatabaseType,
  pagination: Pagination,
  opts: Partial<QueryOpts> = {},
  queryContext = db<T>(context, type, opts)
) => {
  const { first, after, orderMode, orderBy, filters, searchTerm } = pagination;
  const columns = Object.keys(await database(type).columnInfo());
  const currentOffset = after ? Number(atob(after)) : 0;
  queryContext.queryContext({
    ...queryContext.queryContext(),
    ...pagination,
    connection: true,
  });
  if (filters) {
    filters.forEach(({ key, value }) => {
      if (key === FilterKey.Label) {
        if (value.length > 0) {
          queryContext
            .leftJoin('Object_Label as ol', 'ol.object_id', '=', `${type}.id`)
            .whereIn(
              'ol.label_id',
              value.map((id) => extractId(id))
            );
        }
      } else if (key.includes('id')) {
        queryContext.whereIn(
          key,
          value.map((id) => extractId(id))
        );
      } else {
        queryContext.whereIn(key, value);
      }
    });
  }

  const search = [];
  if (searchTerm) {
    searchAttributes.forEach((s) => {
      if (columns.includes(s)) {
        search.push(s);
      }
    });
  }

  if (search.length > 0) {
    const [first, ...others] = search;
    queryContext.andWhere((qb) => {
      qb.orWhereILike(`${type}.${first}`, `%${searchTerm}%`);
      others.forEach((i) => qb.orWhereILike(`${type}.${i}`, `%${searchTerm}%`));
    });
  }

  const totalCountQuery = queryContext
    .clone()
    .clearOrder()
    .clearSelect()
    .clearGroup()
    .countDistinct(`${type}.id as totalCount`);

  queryContext
    .orderBy([{ column: orderBy, order: orderMode }])
    .offset(currentOffset)
    .limit(first);

  const [query, { totalCount }] = await Promise.all([
    queryContext,
    totalCountQuery.first(),
  ]);
  return dbConnections(query, after, first, totalCount ?? 0) as U;
};

export const dbMigration = {
  migrate: () => database.migrate.latest(),
  version: () => database.migrate.currentVersion(),
  seed: () => database.seed.run(),
};

export default config;
