import { buildTypeSubtypeFilterExpression } from '@/components/service/integrations/integration.utils';
import { LogicalMultiSelectSelection } from '@/components/ui/shareable-resource/logical-multi-select/logical-multi-select-form-field';
import { ServiceSlug } from '@/utils/shareable-resources/shareable-resources.types';
import { DocumentMetadataKeyCodeEnum } from '@generated/models/DocumentMetadataKeyCode.enum';
import { FilterKeyEnum } from '@generated/models/FilterKey.enum';
import { LogicalOperatorEnum } from '@generated/models/LogicalOperator.enum';
import { useMemo } from 'react';

type SimpleFiltersParams = {
  serviceInstanceSlug:
    | ServiceSlug.OPEN_CTI_CUSTOM_DASHBOARDS
    | ServiceSlug.OPEN_AEV_SCENARIOS;
  labels: LogicalMultiSelectSelection;
};

type IntegrationFiltersParams = {
  serviceInstanceSlug: ServiceSlug.OPEN_CTI_INTEGRATIONS;
  labels: LogicalMultiSelectSelection;
  deployable: LogicalMultiSelectSelection;
  verified: LogicalMultiSelectSelection;
  integrationTypes: LogicalMultiSelectSelection;
  productVersions: LogicalMultiSelectSelection;
};

export type LogicalFiltersParams =
  | SimpleFiltersParams
  | IntegrationFiltersParams;

export const useLogicalFiltersFromStorage = (params: LogicalFiltersParams) => {
  const { serviceInstanceSlug, labels } = params;
  const deployable = 'deployable' in params ? params.deployable : undefined;
  const verified =
    DocumentMetadataKeyCodeEnum.VERIFIED in params
      ? params.verified
      : undefined;
  const integrationTypes =
    'integrationTypes' in params ? params.integrationTypes : undefined;
  const productVersions =
    'productVersions' in params ? params.productVersions : undefined;

  return useMemo(() => {
    if (serviceInstanceSlug === ServiceSlug.OPEN_CTI_INTEGRATIONS) {
      const typeSubtypeFilter = buildTypeSubtypeFilterExpression(
        integrationTypes!
      );
      return {
        operator: LogicalOperatorEnum.AND,
        children: [
          { leaf: { key: FilterKeyEnum.LABEL, value: Object.keys(labels) } },
          ...(typeSubtypeFilter ? [typeSubtypeFilter] : []),
          {
            leaf: {
              key: FilterKeyEnum.MANAGER_SUPPORTED,
              value: Object.keys(deployable!),
            },
          },
          {
            leaf: {
              key: FilterKeyEnum.VERIFIED,
              value: Object.keys(verified!),
            },
          },
          {
            leaf: {
              key: FilterKeyEnum.PRODUCT_VERSION,
              value: Object.keys(productVersions!),
            },
          },
        ],
      };
    }
    return {
      operator: LogicalOperatorEnum.AND,
      children: [
        {
          leaf: { key: FilterKeyEnum.LABEL, value: Object.keys(labels) },
        },
      ],
    };
  }, [
    serviceInstanceSlug,
    labels,
    deployable,
    verified,
    integrationTypes,
    productVersions,
  ]);
};
