import { buildTypeSubtypeFilterExpression } from '@/components/service/integrations/integration.utils';
import { LogicalMultiSelectSelection } from '@/components/ui/shareable-resource/logical-multi-select/logical-multi-select-form-field';
import { ServiceSlug } from '@/utils/shareable-resources/shareable-resources.types';
import { FilterKeyEnum } from '@generated/models/FilterKey.enum';
import { LogicalOperatorEnum } from '@generated/models/LogicalOperator.enum';
import { useMemo } from 'react';

export const useLogicalFiltersFromStorage = ({
  serviceInstanceSlug,
  labels,
  deployable,
  verified,
  integrationTypes,
  productVersions,
}: {
  serviceInstanceSlug: ServiceSlug;
  labels: LogicalMultiSelectSelection;
  deployable?: LogicalMultiSelectSelection;
  verified?: LogicalMultiSelectSelection;
  integrationTypes?: LogicalMultiSelectSelection;
  productVersions?: LogicalMultiSelectSelection;
}) => {
  return useMemo(() => {
    if (
      [
        ServiceSlug.OPEN_AEV_SCENARIOS,
        ServiceSlug.OPEN_CTI_CUSTOM_DASHBOARDS,
      ].includes(serviceInstanceSlug)
    ) {
      return {
        operator: LogicalOperatorEnum.AND,
        children: [
          {
            leaf: { key: FilterKeyEnum.LABEL, value: Object.keys(labels) },
          },
        ],
      };
    }

    const deployableFilter = deployable
      ? [
          {
            leaf: {
              key: FilterKeyEnum.MANAGER_SUPPORTED,
              value: Object.keys(deployable),
            },
          },
        ]
      : [];

    const verifiedFilter = verified
      ? [
          {
            leaf: {
              key: FilterKeyEnum.VERIFIED,
              value: Object.keys(verified),
            },
          },
        ]
      : [];

    const productVersionsFilter = productVersions
      ? [
          {
            leaf: {
              key: FilterKeyEnum.PRODUCT_VERSION,
              value: Object.keys(productVersions),
            },
          },
        ]
      : [];

    const typeSubtypeFilter =
      buildTypeSubtypeFilterExpression(integrationTypes);
    return {
      operator: LogicalOperatorEnum.AND,
      children: [
        {
          leaf: { key: FilterKeyEnum.LABEL, value: Object.keys(labels) },
        },
        ...(typeSubtypeFilter ? [typeSubtypeFilter] : []),
        ...deployableFilter,
        ...verifiedFilter,
        ...productVersionsFilter,
      ],
    };
  }, [
    labels,
    integrationTypes,
    deployable,
    verified,
    serviceInstanceSlug,
    productVersions,
  ]);
};
