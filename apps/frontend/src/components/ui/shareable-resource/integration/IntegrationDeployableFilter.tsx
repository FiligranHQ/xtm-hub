import {
  ServiceListFacetCounts,
  withFacetCount,
} from '@/components/service/components/header/filter/service-list-facet-counts';
import { LogicalMultiSelectFormField } from '@/components/ui/shareable-resource/logical-multi-select/LogicalMultiSelectFormField';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/hooks/use-service-list-local-storage';
import { useTranslations } from 'next-intl';

interface IntegrationDeployableFilterProps {
  facetCounts?: ServiceListFacetCounts['managerSupported'];
}

export const IntegrationDeployableFilter = ({
  facetCounts,
}: IntegrationDeployableFilterProps) => {
  const { deployable, setDeployable } = useServiceListLocalStorage(
    ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
  );
  const t = useTranslations();

  return (
    <LogicalMultiSelectFormField
      options={[
        {
          label: withFacetCount(
            t(
              'Service.OpenctiIntegrations.Filter.ManagerSupported.AutomaticDeploy'
            ),
            'true',
            facetCounts
          ),
          value: 'true',
        },
        {
          label: withFacetCount(
            t(
              'Service.OpenctiIntegrations.Filter.ManagerSupported.ManualDeploy'
            ),
            'false',
            facetCounts
          ),
          value: 'false',
        },
      ]}
      initialValue={deployable}
      noResultString={t('Utils.NotFound')}
      onValueChange={setDeployable}
      optionLabel={t(
        'Service.OpenctiIntegrations.Filter.ManagerSupported.Label'
      )}
    />
  );
};
