import { type PageInfo } from 'graphql-relay/connection/connection';
import pkg, { type Knex } from 'knex';
import { baseConfig } from './knexconfig';
import {
  DeploymentRequestFilter,
  Filter,
  FilterKey,
  LogicalFilterInput,
  LogicalOperator,
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
import { extractId } from './src/utils/utils';
import { compareVersions, isValidVersion } from './src/utils/versioning';

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
  logicalFilters?: LogicalFilterInput;
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

type JoinFn = (qb: Knex.QueryBuilder, type: DatabaseType) => void;
type WhereFn = (
  qb: Knex.QueryBuilder,
  type: DatabaseType,
  values: string[]
) => void;

type FilterHandler = {
  key: string;
  addJoin?: JoinFn;
  addWhere: WhereFn;
};

const createLabelFilter = (): FilterHandler => ({
  key: FilterKey.Label,
  addJoin: (qb, type) => {
    qb.leftJoin('Object_Label as ol', 'ol.object_id', '=', `${type}.id`);
  },
  addWhere: (qb, _type, values) => {
    if (!values.length) return;
    qb.whereIn('ol.label_id', values.map(extractId));
  },
});

const createTagsFilter = (): FilterHandler => ({
  key: ServiceInstanceFilterKey.Tags,
  addWhere: (qb, _type, values) => {
    if (!values.length) return;
    const formattedValue = values.map((v) => `'${v}'`).join(',');
    qb.whereRaw(`"ServiceInstance"."tags"::text[] @> array[${formattedValue}]`);
  },
});

const createServiceDefinitionIdentifierFilter = (): FilterHandler => ({
  key: ServiceInstanceFilterKey.ServiceDefinitionIdentifier,
  addJoin: (qb, type) => {
    qb.leftJoin(
      'ServiceDefinition',
      'ServiceDefinition.id',
      '=',
      `${type}.service_definition_id`
    );
  },
  addWhere: (qb, _type, values) => {
    if (!values.length) return;
    qb.whereIn('ServiceDefinition.identifier', values);
  },
});

const createProductVersionFilter = (): FilterHandler => ({
  key: FilterKey.ProductVersion,
  addJoin: (qb, _type) => {
    const metaAlias = `metaFilter${FilterKey.ProductVersion}`;
    qb.leftJoin({ [metaAlias]: 'Document_Metadata' }, function () {
      this.on(`${metaAlias}.document_id`, '=', 'Document.id').andOnVal(
        `${metaAlias}.key`,
        '=',
        FilterKey.ProductVersion
      );
    });
  },
  addWhere: (qb, _type, values) => {
    if (!values.length) return;
    const lowestVersion = [...values]
      .filter(isValidVersion)
      .sort(compareVersions)[0]
      ?.replace('-lts', '');

    if (!lowestVersion) {
      return;
    }

    const metaAlias = `metaFilter${FilterKey.ProductVersion}`;
    qb.whereRaw(
      dbRaw(
        `("${metaAlias}"."value" IS NULL OR string_to_array(replace("${metaAlias}"."value", '-lts', ''),'.')::int[] <= string_to_array('${lowestVersion}','.')::int[])`
      )
    );
  },
});

const createMetadataFilterHandler = (key: string): FilterHandler => ({
  key,
  addJoin: (qb, _type) => {
    const metaAlias = `metaFilter${key}`;
    qb.leftJoin({ [metaAlias]: 'Document_Metadata' }, function () {
      this.on(`${metaAlias}.document_id`, '=', 'Document.id').andOnVal(
        `${metaAlias}.key`,
        '=',
        key
      );
    });
  },
  addWhere: (qb, _type, values) => {
    if (!values.length) return;
    const metaAlias = `metaFilter${key}`;
    qb.whereIn(`${metaAlias}.value`, values);
  },
});

const createIdFilterHandler = (key: string): FilterHandler => ({
  key,
  addWhere: (qb, _type, values) => {
    if (!values.length) return;
    qb.whereIn(key, values.map(extractId));
  },
});

const createDefaultFilterHandler = (key: string): FilterHandler => ({
  key,
  addWhere: (qb, _type, values) => {
    if (!values.length) return;
    qb.whereIn(key, values);
  },
});

export const applyFilterJoins = (
  type: DatabaseType,
  queryContext: Knex.QueryBuilder,
  filters: Filters | undefined | null
) => {
  if (!filters?.length) return queryContext;

  const keysSet = new Set<string>();

  for (const { key } of filters) {
    if (!key || keysSet.has(key)) continue;
    keysSet.add(key);

    const f = getFilterHandler(key);
    if (f.addJoin) {
      f.addJoin(queryContext, type);
    }
  }

  return queryContext;
};

const filterHandlers: Record<string, FilterHandler> = {
  [FilterKey.Label]: createLabelFilter(),
  [ServiceInstanceFilterKey.Tags]: createTagsFilter(),
  [ServiceInstanceFilterKey.ServiceDefinitionIdentifier]:
    createServiceDefinitionIdentifierFilter(),
  [FilterKey.ProductVersion]: createProductVersionFilter(),
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
  filter: Filter
) => {
  if (!filter.key) return queryContext;
  const f = getFilterHandler(filter.key);
  f.addWhere(queryContext, type, filter.value);
  return queryContext;
};

export const applyFilters = async (
  type: DatabaseType,
  queryContext: Knex.QueryBuilder,
  filters: Filters
) => {
  if (!filters?.length) return queryContext;

  applyFilterJoins(type, queryContext, filters);
  filters.forEach((filter) => applyFilter(queryContext, type, filter));

  return queryContext;
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
    const metaAlias = 'metaSearch';

    const shouldSearchOnDocumentMetadata = type === 'Document';
    if (shouldSearchOnDocumentMetadata) {
      queryContext.leftJoin({ [metaAlias]: 'Document_Metadata' }, function () {
        this.on(`${metaAlias}.document_id`, '=', 'Document.id');
      });
    }

    queryContext.andWhere((qb) => {
      if (shouldSearchOnDocumentMetadata) {
        qb.orWhereILike(`${metaAlias}.value`, `%${searchTerm}%`);
      }
      qb.orWhereILike(`${type}.${first}`, `%${normalizedSearchTerm}%`);
      others.forEach((i) =>
        qb.orWhereILike(`${type}.${i}`, `%${normalizedSearchTerm}%`)
      );
    });
  }
};

const collectLogicalFilterLeaves = (expr: LogicalFilterInput): Filter[] => {
  if (expr.leaf) {
    return [expr.leaf];
  }

  if (expr.children?.length) {
    return expr.children.flatMap(collectLogicalFilterLeaves);
  }

  return [];
};

const applyLogicalFilterJoins = (
  type: DatabaseType,
  qb: Knex.QueryBuilder,
  expr: LogicalFilterInput
) => {
  const leaves = collectLogicalFilterLeaves(expr);
  const seenKeys = new Set<string>();

  for (const leaf of leaves) {
    if (!leaf.key || seenKeys.has(leaf.key)) continue;
    seenKeys.add(leaf.key);

    const filter = getFilterHandler(leaf.key);
    if (filter.addJoin) {
      filter.addJoin(qb, type);
    }
  }
};

const applyLogicalFilterWhere = (
  type: DatabaseType,
  qb: Knex.QueryBuilder,
  logicalFilter: LogicalFilterInput
) => {
  if (logicalFilter.leaf) {
    const filter = getFilterHandler(logicalFilter.leaf.key);
    filter.addWhere(qb, type, logicalFilter.leaf.value);
    return;
  }
  if (logicalFilter.operator && logicalFilter.children?.length) {
    qb.where((groupQb) => {
      logicalFilter.children.forEach((child, index) => {
        if (index === 0) {
          groupQb.where((subQb) => {
            applyLogicalFilterWhere(type, subQb, child);
          });
          return;
        }

        if (logicalFilter.operator === LogicalOperator.Or) {
          groupQb.orWhere((subQb) => {
            applyLogicalFilterWhere(type, subQb, child);
          });
        } else {
          groupQb.andWhere((subQb) => {
            applyLogicalFilterWhere(type, subQb, child);
          });
        }
      });
    });
  }
};

const applyLogicalFilter = (
  type: DatabaseType,
  qb: Knex.QueryBuilder,
  logicalFilter?: LogicalFilterInput
) => {
  if (!logicalFilter) return qb;
  applyLogicalFilterJoins(type, qb, logicalFilter);
  applyLogicalFilterWhere(type, qb, logicalFilter);
};

export const paginate = async <T, U>(
  type: DatabaseType,
  pagination: Pagination,
  opts: Partial<QueryOpts> = {},
  queryContext = db<T>(type)
) => {
  const {
    first,
    after,
    orderMode,
    orderBy,
    filters,
    logicalFilters,
    searchTerm,
  } = pagination;
  const currentOffset = after ? Number(atob(after)) : 0;
  queryContext.queryContext({
    ...queryContext.queryContext(),
    ...pagination,
    connection: true,
  });

  applyLogicalFilter(type, queryContext, logicalFilters);

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
