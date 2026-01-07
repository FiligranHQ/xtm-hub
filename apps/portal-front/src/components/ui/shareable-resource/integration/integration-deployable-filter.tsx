import { ServiceListFilterContainer } from '@/components/service/components/header/filter/service-list-filter-container';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/components/service/components/use-service-list-local-storage';
import { MultiSelectFormField } from '@filigran/ui';
import { useTranslations } from 'next-intl';

export const IntegrationDeployableFilter = () => {
  const { deployable, setDeployable } = useServiceListLocalStorage(
    ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
  );
  const t = useTranslations();
  return (
    <ServiceListFilterContainer>
      <MultiSelectFormField
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
        defaultValue={deployable}
        placeholder={t(
          'Service.OpenctiIntegrations.Filter.ManagerSupported.Placeholder'
        )}
        noResultString={t('Utils.NotFound')}
        onValueChange={setDeployable}
        variant="inverted"
      />
    </ServiceListFilterContainer>
  );
};
