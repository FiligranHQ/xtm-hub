import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import { LogicalMultiSelectFormField } from '@/components/ui/shareable-resource/logical-multi-select/LogicalMultiSelectFormField';
import { useServiceListFilters } from '@/hooks/use-service-list-filters';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/hooks/use-service-list-local-storage';

import { useTranslate } from '@tolgee/react';
export const IntegrationVerifiedFilter = () => {
  const { verified, setVerified, removeVerified } = useServiceListLocalStorage(
    ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
  );
  const { t } = useTranslate();
  const { removeFilter } = useServiceListFilters();
  const removeVerifiedFilter = () => {
    removeVerified();
    removeFilter(ServiceListFilterKey.Verified);
  };

  return (
    <LogicalMultiSelectFormField
      options={[
        {
          label: t('Service_OpenctiIntegrations_Filter_Verified_Verified'),
          value: 'true',
        },
        {
          label: t('Service_OpenctiIntegrations_Filter_Verified_Unverified'),
          value: 'false',
        },
      ]}
      initialValue={verified}
      placeholder={t('Service_OpenctiIntegrations_Filter_Verified_Placeholder')}
      noResultString={t('Utils_NotFound')}
      onValueChange={setVerified}
      onRemove={removeVerifiedFilter}
      optionLabel={t('Service_OpenctiIntegrations_Filter_Verified_Label')}
    />
  );
};
