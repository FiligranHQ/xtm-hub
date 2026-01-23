import { ServiceListFilterKey } from '@/components/service/components/header/service-list-header';
import { useServiceListFilters } from '@/components/service/components/use-service-list-filters';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/components/service/components/use-service-list-local-storage';
import { LogicalMultiSelectFormField } from '@/components/ui/shareable-resource/logical-multi-select/logical-multi-select-form-field';
import { useTranslations } from 'next-intl';

export const IntegrationDeployableFilter = () => {
  const { deployable, setDeployable, removeDeployable } =
    useServiceListLocalStorage(
      ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
    );
  const t = useTranslations();
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
