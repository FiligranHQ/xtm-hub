import { type PageInfo } from 'graphql-relay/connection/connection';
import pkg, { type Knex } from 'knex';
import { baseConfig } from './knexconfig';
import {
  DeploymentRequestFilter,
  Filter,
  FilterKey,
  ServiceInstanceFilter,
  ServiceInstanceFilterKey,
} from './src/__generated__/resolvers-types';
import portalConfig from './src/config';
import { databaseContext } from './src/context/database.context';
import { requestContext } from './src/context/request.context';
import { PortalContext } from './src/model/portal-context';
import { normalizeDocumentName } from './src/modules/services/document/document.helper';
import { INTEGRATION_METADATA_KEYS } from './src/modules/services/integrations/integrations.model';
import { applyDbSecurityLayer } from './src/security/access';
import { logApp } from './src/utils/app-logger.util';
import { compareSemanticVersions } from './src/utils/semantic-versioning';
import { extractId } from './src/utils/utils';

type Filters = Filter[] | DeploymentRequestFilter[] | ServiceInstanceFilter[];

export interface SecuryQueryOpts {
  [key: string]: string | number | boolean | string[] | MethodType | Filters;
}

export interface KnexQueryBuilder extends Knex.QueryBuilder {
  _queryContext?: {
    context: PortalContext;
    __typename: DatabaseType;
  };
}

declare module 'knex' {
  // TODO: Knex specificity, could be complicated modify the model directly
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Knex {
    interface QueryBuilder {
      asConnection<T>(): Promise<T>;
      secureQuery(opt?: SecuryQueryOpts): Knex.QueryBuilder;
      tap(fn: (qb: this) => this): this;
    }
  }
}

type FilterHandler = (
  queryContext: KnexQueryBuilder,
  type: DatabaseType,
  value: string[]
) => void;

type BaseDatabaseType =
  | 'User'
  | 'Organization'
  | 'ServiceInstance'
  | 'ServiceDefinition'
  | 'User_RolePortal'
  | 'RolePortal'
  | 'CapabilityPortal'
  | 'RolePortal_CapabilityPortal'
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
  | 'User_Organization_Pending'
  | 'Label'
  | 'Object_Label'
  | 'UserOrganization_Capability'
  | 'User_TransferRequest'
  | 'Document_Children'
  | 'Document_Metadata'
  | 'Service_Contract'
  | 'Service_Configuration'
  | 'DeploymentRequest'
  | 'DeploymentRequestQuota'
  | 'ServiceGroup'
  | 'ServiceGroup_User'
  | 'SSOGroup_RolePortal';

export type DatabaseType =
  | BaseDatabaseType
  | (typeof process.env.NODE_ENV extends 'test' ? 'TestTable' : never);

export type ActionType = 'add' | 'edit' | 'delete' | 'merge' | 'invalidate';
export type MethodType = 'select' | 'insert' | 'update' | 'del';

interface Pagination {
  first?: number;
  after?: string;
  orderMode?: string;
  orderBy?: string;
  filters?: Filters;
  searchTerm?: string;
}

const knex = pkg;

pkg.QueryBuilder.extend('secureQuery', function (opts: SecuryQueryOpts) {
  return applyDbSecurityLayer(this, opts);
});
pkg.QueryBuilder.extend('tap', function (fn) {
  return fn(this) || this;
});
const config: Knex.Config = {
  ...baseConfig,
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
  log: {
    warn: logApp.warn,
    error: logApp.error,
    debug: logApp.debug,
  },
};

export const database = knex(config);

export interface QueryOpts {
  unsecured?: boolean;
  first?: number;
  after?: string;
  orderMode?: string;
  orderBy?: string;
  methodType?: MethodType;
  capabilities?: string[];
  searchTerm?: string;
  filters?: Filters;
  columns?: string[];
  normalizeSearchTerm?: boolean;
}

export const dbRaw = (
  statement: string,
  binding?: Knex.RawBinding | Knex.RawBinding[]
) => database.raw(statement, binding);

export const dbTx = () => database.transaction();

export function db<T>(
  type: DatabaseType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Knex.QueryBuilder<T, any> {
  const reqContext = requestContext.get();

  const queryContext = database<T>(type).queryContext({
    __typename: type,
    context: reqContext?.portalContext,
  });

  if (reqContext?.trx && !reqContext.trx.isCompleted()) {
    queryContext.transacting(reqContext.trx);
  } else if (databaseContext.isInTransaction()) {
    queryContext.transacting(databaseContext.getTransaction());
  }

  return queryContext;
}

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
  'country',
];

const filterHandlers: Record<string, FilterHandler> = {
  [FilterKey.Label]: (queryContext, type, value) => {
    if (value.length === 0) return;

    queryContext
      .leftJoin('Object_Label as ol', 'ol.object_id', '=', `${type}.id`)
      .whereIn('ol.label_id', value.map(extractId));
  },

  [ServiceInstanceFilterKey.Tags]: (queryContext, type, value) => {
    if (value.length === 0) return;

    const formattedValue = value.map((value) => `'${value}'`).join(',');
    queryContext.whereRaw(
      `"ServiceInstance"."tags"::text[] @> array[${formattedValue}]`
    );
  },

  [ServiceInstanceFilterKey.ServiceDefinitionIdentifier]: (
    queryContext,
    type,
    value
  ) => {
    if (value.length === 0) return;

    queryContext
      .leftJoin(
        'ServiceDefinition',
        'ServiceDefinition.id',
        '=',
        `${type}.service_definition_id`
      )
      .whereIn('ServiceDefinition.identifier', value);
  },

  [FilterKey.ProductVersion]: (queryContext, type, value) => {
    if (value.length === 0) return;

    const lowestVersion = value.sort(compareSemanticVersions)[0];
    const metaAlias = `metaFilter${FilterKey.ProductVersion}`;

    queryContext
      .leftJoin({ [metaAlias]: 'Document_Metadata' }, function () {
        this.on(`${metaAlias}.document_id`, '=', 'Document.id').andOnVal(
          `${metaAlias}.key`,
          '=',
          FilterKey.ProductVersion
        );
      })
      .whereRaw(
        dbRaw(
          `("${metaAlias}"."value" IS NULL OR string_to_array("${metaAlias}"."value",'.')::int[] <= string_to_array('${lowestVersion}','.')::int[])`
        )
      );
  },
};
const createIdFilterHandler =
  (key: string): FilterHandler =>
  (queryContext, type, value) => {
    queryContext.whereIn(key, value.map(extractId));
  };

const createDefaultFilterHandler =
  (key: string): FilterHandler =>
  (queryContext, type, value) => {
    queryContext.whereIn(key, value);
  };

const createMetadataFilterHandler =
  (key: string): FilterHandler =>
  (queryContext, _, value) => {
    if (value.length === 0) return;

    const metaAlias = `metaFilter${key}`;
    queryContext
      .leftJoin({ [metaAlias]: 'Document_Metadata' }, function () {
        this.on(`${metaAlias}.document_id`, '=', 'Document.id').andOnVal(
          `${metaAlias}.key`,
          '=',
          key
        );
      })
      .whereIn(`${metaAlias}.value`, value);
  };

const getFilterHandler = (key: string): FilterHandler => {
  if (filterHandlers[key]) {
    return filterHandlers[key];
  }

  // Check if it's a metadata filter
  if (INTEGRATION_METADATA_KEYS.includes(key)) {
    return createMetadataFilterHandler(key);
  }

  // Check if it's an ID filter
  if (key.includes('id')) {
    return createIdFilterHandler(key);
  }

  // Use default handler
  return createDefaultFilterHandler(key);
};

export const applyFilter = (
  queryContext: Knex.QueryBuilder,
  type: DatabaseType,
  { key, value }: { key: string; value: string[] }
) => {
  const handler = getFilterHandler(key);
  handler(queryContext, type, value);
  return queryContext;
};

export const applyFilters = async <T>(
  type: DatabaseType,
  queryContext = db<T>(type),
  filters: Filters
) => {
  if (filters) {
    filters.forEach((filter) => applyFilter(queryContext, type, filter));
  }
};

export const applySearch = async <T>(
  type: DatabaseType,
  queryContext = db<T>(type),
  searchTerm: string,
  normalizeSearchTerm: boolean = false
) => {
  const columns = Object.keys(await database(type).columnInfo());

  const search = [];
  if (searchTerm) {
    searchAttributes.forEach((s) => {
      if (columns.includes(s)) {
        search.push(s);
      }
    });
  }

  if (search.length > 0) {
    const normalizedSearchTerm = normalizeSearchTerm
      ? normalizeDocumentName(searchTerm)
      : searchTerm;
    const [first, ...others] = search;

    const shouldSearchOnDocumentMetadata = type === 'Document';

    queryContext.andWhere((qb) => {
      if (shouldSearchOnDocumentMetadata) {
        qb.orWhereExists(function () {
          this.select('*')
            .from('Document_Metadata')
            .whereRaw('Document_Metadata.document_id = Document.id')
            .andWhereILike('Document_Metadata.value', `%${searchTerm}%`);
        });
      }
      qb.orWhereILike(`${type}.${first}`, `%${normalizedSearchTerm}%`);
      others.forEach((i) =>
        qb.orWhereILike(`${type}.${i}`, `%${normalizedSearchTerm}%`)
      );
    });
  }
};

export const paginate = async <T, U>(
  type: DatabaseType,
  pagination: Pagination,
  opts: Partial<QueryOpts> = {},
  queryContext = db<T>(type)
) => {
  const { first, after, orderMode, orderBy, filters, searchTerm } = pagination;
  const currentOffset = after ? Number(atob(after)) : 0;
  queryContext.queryContext({
    ...queryContext.queryContext(),
    ...pagination,
    connection: true,
  });

  await applyFilters(type, queryContext, filters);

  await applySearch(type, queryContext, searchTerm, opts.normalizeSearchTerm);

  const totalCountQuery = queryContext
    .clone()
    .clearOrder()
    .clearSelect()
    .clearGroup()
    .countDistinct(`${type}.id as totalCount`)
    .first()
    .secureQuery({ ...opts });

  queryContext
    .orderBy([{ column: orderBy, order: orderMode, nulls: 'last' }])
    .offset(currentOffset)
    .limit(first)
    .select(`${type}.*`)
    .secureQuery({ ...opts });

  const [query, { totalCount }] = await Promise.all([
    queryContext,
    totalCountQuery,
  ]);
  return dbConnections(query, after, first, totalCount ?? 0) as U;
};

export const dbMigration = {
  migrate: () => database.migrate.latest(),
  version: () => database.migrate.currentVersion(),
  seed: () => database.seed.run(),
};

export default config;
