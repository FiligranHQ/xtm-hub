import { buildTypeSubtypeFilterExpression } from '@/components/service/integrations/integration.utils';
import { LogicalMultiSelectSelection } from '@/components/ui/shareable-resource/logical-multi-select/logical-multi-select-form-field';
import { ServiceSlug } from '@/utils/shareable-resources/shareable-resources.types';
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
  return useMemo(() => {
    if (params.serviceInstanceSlug === ServiceSlug.OPEN_CTI_INTEGRATIONS) {
      const {
        labels,
        deployable,
        verified,
        integrationTypes,
        productVersions,
      } = params;

      const deployableFilter = [
        {
          leaf: {
            key: FilterKeyEnum.MANAGER_SUPPORTED,
            value: Object.keys(deployable),
          },
        },
      ];

      const verifiedFilter = [
        { leaf: { key: FilterKeyEnum.VERIFIED, value: Object.keys(verified) } },
      ];

      const productVersionsFilter = [
        {
          leaf: {
            key: FilterKeyEnum.PRODUCT_VERSION,
            value: Object.keys(productVersions),
          },
        },
      ];

      const typeSubtypeFilter =
        buildTypeSubtypeFilterExpression(integrationTypes);
      return {
        operator: LogicalOperatorEnum.AND,
        children: [
          { leaf: { key: FilterKeyEnum.LABEL, value: Object.keys(labels) } },
          ...(typeSubtypeFilter ? [typeSubtypeFilter] : []),
          ...deployableFilter,
          ...verifiedFilter,
          ...productVersionsFilter,
        ],
      };
    }
    return {
      operator: LogicalOperatorEnum.AND,
      children: [
        {
          leaf: { key: FilterKeyEnum.LABEL, value: Object.keys(params.labels) },
        },
      ],
    };
  }, [
    params.serviceInstanceSlug,
    params.labels,
    'deployable' in params ? params.deployable : undefined,
    'verified' in params ? params.verified : undefined,
    'integrationTypes' in params ? params.integrationTypes : undefined,
    'productVersions' in params ? params.productVersions : undefined,
  ]);
};
