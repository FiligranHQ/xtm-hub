import {
  applyLogicalFilter,
  applySearch,
  db,
  dbRaw,
} from '../../../../knexfile';
import {
  DocumentMetadataKeyCode,
  Facet,
  FacetBucket,
  FilterKey,
  LoadDocumentFacetInput,
  LogicalFilterInput,
} from '../../../__generated__/resolvers-types';
import type Document from '../../../model/kanel/public/Document';
import { restrictServiceInstanceToPublic } from '../../../security/restriction/service-instance';
import { TAG_DECOUPLING } from '../../shareable-resource/manifest-fragment/manifest-fragment.helper';

type FacetRow = {
  value: string;
  count: string | number;
};
type DocumentIdsQuery = ReturnType<typeof db<Document>>;

const excludeDecouplingTag = (query: ReturnType<typeof db<Document>>) =>
  query.whereRaw(
    `NOT (? ILIKE ANY(COALESCE("Document"."tags", ARRAY[]::text[])))`,
    [TAG_DECOUPLING]
  );

const toFacetBuckets = (rows: FacetRow[]): FacetBucket[] =>
  rows.map(({ value, count }) => ({
    value,
    count: Number(count),
  }));

const stripFilterKeyFromLogicalFilter = (
  logicalFilter: LogicalFilterInput | null | undefined,
  filterKey: FilterKey
): LogicalFilterInput | undefined => {
  if (!logicalFilter) {
    return undefined;
  }

  if (logicalFilter.leaf) {
    return logicalFilter.leaf.key === filterKey ? undefined : logicalFilter;
  }

  if (!logicalFilter.children?.length) {
    return undefined;
  }

  const children = logicalFilter.children
    .map((child) => stripFilterKeyFromLogicalFilter(child, filterKey))
    .filter((child): child is LogicalFilterInput => child !== undefined);

  if (!children.length) {
    return undefined;
  }

  if (children.length === 1) {
    return children[0];
  }

  return {
    operator: logicalFilter.operator,
    children,
  };
};

const buildScopedDocumentIdsQuery = ({
  serviceInstanceId,
  documentType,
  logicalFilters,
}: LoadDocumentFacetInput) => {
  const query = db<Document>('Document')
    .select('Document.id')
    .leftJoin(
      'ServiceInstance',
      'Document.service_instance_id',
      'ServiceInstance.id'
    )
    .tap(restrictServiceInstanceToPublic)
    .where('Document.active', '=', true)
    .where('Document.service_instance_id', '=', serviceInstanceId)
    .modify((builder) => {
      if (documentType != null) {
        builder.where('Document.type', '=', documentType);
      }
    })
    .modify(excludeDecouplingTag)
    .whereNotExists(function () {
      this.select(dbRaw('1'))
        .from('Document_Children')
        .whereRaw('"Document_Children"."child_document_id" = "Document"."id"');
    })
    .groupBy('Document.id');

  applyLogicalFilter('Document', query, logicalFilters ?? undefined);
  return query;
};

const loadMetadataFacetBucketsGrouped = async (
  documentIdsQuery: DocumentIdsQuery,
  keys: DocumentMetadataKeyCode[]
): Promise<Record<string, FacetBucket[]>> => {
  if (keys.length === 0) {
    return {};
  }

  const rows = (await db('Document_Metadata')
    .from('Document_Metadata as metadata')
    .select('metadata.key as key', 'metadata.value as value')
    .countDistinct({ count: 'metadata.document_id' })
    .whereIn('metadata.key', keys)
    .whereNotNull('metadata.value')
    .whereIn('metadata.document_id', documentIdsQuery.clone())
    .groupBy(['metadata.key', 'metadata.value'])
    .orderBy('metadata.key', 'asc')
    .orderBy('count', 'desc')
    .orderBy('metadata.value', 'asc')) as Array<
    FacetRow & { key: DocumentMetadataKeyCode }
  >;

  const grouped = rows.reduce<Record<string, FacetRow[]>>((acc, row) => {
    const bucketKey = row.key;
    const current = acc[bucketKey] ?? [];
    current.push({ value: row.value, count: row.count });
    acc[bucketKey] = current;
    return acc;
  }, {});

  return Object.fromEntries(
    keys.map((key) => [key, toFacetBuckets(grouped[key] ?? [])] as const)
  );
};

const loadMetadataFacetBuckets = async (
  documentIdsQuery: DocumentIdsQuery,
  key: DocumentMetadataKeyCode
) => {
  const facetsByKey = await loadMetadataFacetBucketsGrouped(documentIdsQuery, [
    key,
  ]);
  return facetsByKey[key] ?? [];
};

const loadUseCaseFacetBuckets = async (documentIdsQuery: DocumentIdsQuery) => {
  const rows = (await db('Object_UseCase')
    .from('Object_UseCase as objectUseCase')
    .select('objectUseCase.use_case_id as value')
    .countDistinct({ count: 'objectUseCase.object_id' })
    .whereIn('objectUseCase.object_id', documentIdsQuery.clone())
    .groupBy('objectUseCase.use_case_id')
    .orderBy('count', 'desc')
    .orderBy('objectUseCase.use_case_id', 'asc')) as FacetRow[];

  return toFacetBuckets(rows);
};

const loadSolutionCategoryFacetBuckets = async (
  documentIdsQuery: DocumentIdsQuery
) => {
  const rows = (await db('Object_SolutionCategory')
    .from('Object_SolutionCategory as objectSolutionCategory')
    .select('objectSolutionCategory.solution_category_id as value')
    .countDistinct({ count: 'objectSolutionCategory.object_id' })
    .whereIn('objectSolutionCategory.object_id', documentIdsQuery.clone())
    .groupBy('objectSolutionCategory.solution_category_id')
    .orderBy('count', 'desc')
    .orderBy(
      'objectSolutionCategory.solution_category_id',
      'asc'
    )) as FacetRow[];

  return toFacetBuckets(rows);
};

const loadEntityTypeFacetBuckets = async (
  documentIdsQuery: DocumentIdsQuery
) => {
  const rows = (await db('Document_Metadata')
    .from('Document_Metadata as metadata')
    .joinRaw(
      'CROSS JOIN LATERAL jsonb_array_elements_text("metadata"."value"::jsonb) as entity(value)'
    )
    .select('entity.value as value')
    .countDistinct({ count: 'metadata.document_id' })
    .where('metadata.key', '=', DocumentMetadataKeyCode.EntityTypes)
    .whereNotNull('metadata.value')
    .whereIn('metadata.document_id', documentIdsQuery.clone())
    .groupBy('entity.value')
    .orderBy('count', 'desc')
    .orderBy('entity.value', 'asc')) as FacetRow[];

  return toFacetBuckets(rows);
};

const buildScopedQueryByFilterKey = (
  input: LoadDocumentFacetInput,
  filterKey: FilterKey
) =>
  buildScopedDocumentIdsQuery({
    ...input,
    logicalFilters: stripFilterKeyFromLogicalFilter(
      input.logicalFilters,
      filterKey
    ),
  });

const loadBucketsWithScopedDocuments = async <T>(
  input: LoadDocumentFacetInput,
  filterKey: FilterKey,
  loader: (documentIdsQuery: DocumentIdsQuery) => Promise<T>
): Promise<T> => {
  const documentIdsQuery = buildScopedQueryByFilterKey(input, filterKey);
  await applySearch(
    'Document',
    documentIdsQuery,
    input.searchTerm ?? undefined,
    true
  );
  return loader(documentIdsQuery);
};

export const FacetDomain = {
  loadDocumentFacets: async (input: LoadDocumentFacetInput): Promise<Facet> => {
    const [
      integrationType,
      licenseType,
      managerSupported,
      verified,
      productVersion,
      solutionCategory,
      useCase,
      entityType,
    ] = await Promise.all([
      loadBucketsWithScopedDocuments(
        input,
        FilterKey.IntegrationType,
        (query) =>
          loadMetadataFacetBuckets(
            query,
            DocumentMetadataKeyCode.IntegrationType
          )
      ),
      loadBucketsWithScopedDocuments(input, FilterKey.LicenseType, (query) =>
        loadMetadataFacetBuckets(query, DocumentMetadataKeyCode.LicenseType)
      ),
      loadBucketsWithScopedDocuments(
        input,
        FilterKey.ManagerSupported,
        (query) =>
          loadMetadataFacetBuckets(
            query,
            DocumentMetadataKeyCode.ManagerSupported
          )
      ),
      loadBucketsWithScopedDocuments(input, FilterKey.Verified, (query) =>
        loadMetadataFacetBuckets(query, DocumentMetadataKeyCode.Verified)
      ),
      loadBucketsWithScopedDocuments(input, FilterKey.ProductVersion, (query) =>
        loadMetadataFacetBuckets(query, DocumentMetadataKeyCode.ProductVersion)
      ),
      loadBucketsWithScopedDocuments(
        input,
        FilterKey.SolutionCategory,
        loadSolutionCategoryFacetBuckets
      ),
      loadBucketsWithScopedDocuments(
        input,
        FilterKey.Label,
        loadUseCaseFacetBuckets
      ),
      loadBucketsWithScopedDocuments(
        input,
        FilterKey.EntityType,
        loadEntityTypeFacetBuckets
      ),
    ]);

    return {
      integration_type: integrationType,
      license_type: licenseType,
      manager_supported: managerSupported,
      verified,
      product_version: productVersion,
      solution_category: solutionCategory,
      use_case: useCase,
      entity_type: entityType,
    };
  },
};
