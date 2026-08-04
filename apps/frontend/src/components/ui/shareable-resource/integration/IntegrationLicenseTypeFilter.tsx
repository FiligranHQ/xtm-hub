import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import { LogicalMultiSelectFormField } from '@/components/ui/shareable-resource/logical-multi-select/LogicalMultiSelectFormField';
import { useServiceListFilters } from '@/hooks/use-service-list-filters';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/hooks/use-service-list-local-storage';
import { LicenseType } from '@graphql/generated';
import { useTranslations } from 'next-intl';

export const IntegrationLicenseTypeFilter = () => {
  const { licenseTypes, setLicenseTypes, removeLicenseTypes } =
    useServiceListLocalStorage(
      ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
    );
  const t = useTranslations();
  const { removeFilter } = useServiceListFilters();

  const removeLicenseTypeFilter = () => {
    removeLicenseTypes();
    removeFilter(ServiceListFilterKey.LicenseType);
  };

  return (
    <LogicalMultiSelectFormField
      options={[
        {
          label: t('Service.OpenctiIntegrations.Filter.LicenseType.Free'),
          value: LicenseType.Free,
        },
        {
          label: t('Service.OpenctiIntegrations.Filter.LicenseType.Commercial'),
          value: LicenseType.Commercial,
        },
      ]}
      initialValue={licenseTypes}
      placeholder={t(
        'Service.OpenctiIntegrations.Filter.LicenseType.Placeholder'
      )}
      noResultString={t('Utils.NotFound')}
      onValueChange={setLicenseTypes}
      onRemove={removeLicenseTypeFilter}
      optionLabel={t('Service.OpenctiIntegrations.Filter.LicenseType.Label')}
    />
  );
};
