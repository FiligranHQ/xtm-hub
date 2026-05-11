import { LogicalMultiSelectSelection } from '@/components/ui/shareable-resource/logical-multi-select/LogicalMultiSelectFormField';
import { IntegrationSubTypeEnum } from '@generated/models/IntegrationSubType.enum';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';

export const INTEGRATION_TYPE_PARAM = 'integrationType';
export const LABEL_PARAM = 'label';
export const DEPLOYABLE_PARAM = 'deployable';
export const VERIFIED_PARAM = 'verified';
export const PRODUCT_VERSION_PARAM = 'productVersion';

export const ALL_FILTER_PARAMS = [
  INTEGRATION_TYPE_PARAM,
  LABEL_PARAM,
  DEPLOYABLE_PARAM,
  VERIFIED_PARAM,
  PRODUCT_VERSION_PARAM,
] as const;

export type FilterParamName = (typeof ALL_FILTER_PARAMS)[number];

const validIntegrationTypes = new Set(Object.values(IntegrationTypeEnum));
const validIntegrationSubTypes = new Set(Object.values(IntegrationSubTypeEnum));

/**
 * Serializes a LogicalMultiSelectSelection to a compact string.
 * Entries are comma-separated; subtypes within an entry are pipe-separated.
 *
 * Example: { connector: ['EXTERNAL_IMPORT', 'INTERNAL_ENRICHMENT'], csv_feed: [] }
 *   → 'connector:EXTERNAL_IMPORT|INTERNAL_ENRICHMENT,csv_feed'
 */
export const serializeSelection = (
  selection: LogicalMultiSelectSelection
): string =>
  Object.entries(selection)
    .map(([key, subtypes]) =>
      subtypes.length > 0 ? `${key}:${[...subtypes].sort().join('|')}` : key
    )
    .sort()
    .join(',');

/**
 * Parses a compact param string into a LogicalMultiSelectSelection.
 * For integrationType, validates types and subtypes against known enums.
 * For other params, accepts any non-empty key.
 *
 * Example: 'connector:EXTERNAL_IMPORT|INTERNAL_ENRICHMENT,csv_feed'
 *   → { connector: ['EXTERNAL_IMPORT', 'INTERNAL_ENRICHMENT'], csv_feed: [] }
 */
export const parseSelection = (
  raw: string | null,
  paramName: FilterParamName
): LogicalMultiSelectSelection => {
  if (!raw) return {};
  const result: LogicalMultiSelectSelection = {};
  for (const entry of raw.split(',')) {
    const colonIndex = entry.indexOf(':');
    const key = colonIndex === -1 ? entry : entry.slice(0, colonIndex);
    const subtypesRaw = colonIndex === -1 ? '' : entry.slice(colonIndex + 1);

    if (paramName === INTEGRATION_TYPE_PARAM) {
      if (!validIntegrationTypes.has(key as IntegrationTypeEnum)) continue;
      result[key] = subtypesRaw
        ? subtypesRaw
            .split('|')
            .filter((s) =>
              validIntegrationSubTypes.has(s as IntegrationSubTypeEnum)
            )
        : [];
    } else {
      if (!key) continue;
      result[key] = [];
    }
  }
  return result;
};

export type AllFilters = Record<FilterParamName, LogicalMultiSelectSelection>;

export const emptyFilters = (): AllFilters =>
  Object.fromEntries(ALL_FILTER_PARAMS.map((p) => [p, {}])) as AllFilters;

export const parseAllFiltersFromWindowSearch = (): AllFilters => {
  const params =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  return Object.fromEntries(
    ALL_FILTER_PARAMS.map((name) => [
      name,
      parseSelection(params.get(name), name),
    ])
  ) as AllFilters;
};

export const buildAllFiltersSearchParams = (filters: AllFilters): string => {
  const params = new URLSearchParams();
  for (const paramName of ALL_FILTER_PARAMS) {
    const serialized = serializeSelection(filters[paramName] ?? {});
    if (serialized) params.set(paramName, serialized);
  }
  return params.toString();
};

export const allFiltersKey = (filters: AllFilters): string =>
  ALL_FILTER_PARAMS.map((name) => serializeSelection(filters[name] ?? {})).join(
    '||'
  );
