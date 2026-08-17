import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import { LogicalMultiSelectFormField } from '@/components/ui/shareable-resource/logical-multi-select/LogicalMultiSelectFormField';
import { useServiceListFilters } from '@/hooks/use-service-list-filters';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/hooks/use-service-list-local-storage';
import { LicenseType } from '@graphql/generated';

import { useTranslate } from '@tolgee/react';
export const IntegrationLicenseTypeFilter = () => {
  const { licenseTypes, setLicenseTypes, removeLicenseTypes } =
    useServiceListLocalStorage(
      ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
    );
  const { t } = useTranslate();
  const { removeFilter } = useServiceListFilters();

  const removeLicenseTypeFilter = () => {
    removeLicenseTypes();
    removeFilter(ServiceListFilterKey.LicenseType);
  };

  return (
    <LogicalMultiSelectFormField
      options={[
        {
          label: t('Service_OpenctiIntegrations_Filter_LicenseType_Free'),
          value: LicenseType.Free,
        },
        {
          label: t('Service_OpenctiIntegrations_Filter_LicenseType_Commercial'),
          value: LicenseType.Commercial,
        },
      ]}
      initialValue={licenseTypes}
      placeholder={t(
        'Service_OpenctiIntegrations_Filter_LicenseType_Placeholder'
      )}
      noResultString={t('Utils_NotFound')}
      onValueChange={setLicenseTypes}
      onRemove={removeLicenseTypeFilter}
      optionLabel={t('Service_OpenctiIntegrations_Filter_LicenseType_Label')}
    />
  );
};
