import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import { LogicalMultiSelectFormField } from '@/components/ui/shareable-resource/logical-multi-select/LogicalMultiSelectFormField';
import { useServiceListFilters } from '@/hooks/use-service-list-filters';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/hooks/use-service-list-local-storage';
import { useTranslate } from '@/hooks/use-translate';

export const IntegrationDeployableFilter = () => {
  const { deployable, setDeployable, removeDeployable } =
    useServiceListLocalStorage(
      ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
    );
  const t = useTranslate();
  const { removeFilter } = useServiceListFilters();
  const removeDeployableFilter = () => {
    removeDeployable();
    removeFilter(ServiceListFilterKey.ManagerSupported);
  };

  return (
    <LogicalMultiSelectFormField
      options={[
        {
          label: t(
            'Service.OpenctiIntegrations.Filter.ManagerSupported.AutomaticDeploy'
          ),
          value: 'true',
        },
        {
          label: t(
            'Service.OpenctiIntegrations.Filter.ManagerSupported.ManualDeploy'
          ),
          value: 'false',
        },
      ]}
      initialValue={deployable}
      placeholder={t(
        'Service.OpenctiIntegrations.Filter.ManagerSupported.Placeholder'
      )}
      noResultString={t('Utils.NotFound')}
      onValueChange={setDeployable}
      onRemove={removeDeployableFilter}
      optionLabel={t(
        'Service.OpenctiIntegrations.Filter.ManagerSupported.Label'
      )}
    />
  );
};
