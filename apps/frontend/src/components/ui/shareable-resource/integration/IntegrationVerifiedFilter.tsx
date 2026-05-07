import { useTranslations } from 'next-intl';
import { useServiceListFilters } from '@/hooks/use-service-list-filters';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/hooks/use-service-list-local-storage';
import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import { LogicalMultiSelectFormField } from '@/components/ui/shareable-resource/logical-multi-select/LogicalMultiSelectFormField';

export const IntegrationVerifiedFilter = () => {
  const { verified, setVerified, removeVerified } = useServiceListLocalStorage(
    ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
  );
  const t = useTranslations();
  const { removeFilter } = useServiceListFilters();
  const removeVerifiedFilter = () => {
    removeVerified();
    removeFilter(ServiceListFilterKey.Verified);
  };

  return (
    <LogicalMultiSelectFormField
      options={[
        {
          label: t('Service.OpenctiIntegrations.Filter.Verified.Verified'),
          value: 'true',
        },
        {
          label: t('Service.OpenctiIntegrations.Filter.Verified.Unverified'),
          value: 'false',
        },
      ]}
      initialValue={verified}
      placeholder={t('Service.OpenctiIntegrations.Filter.Verified.Placeholder')}
      noResultString={t('Utils.NotFound')}
      onValueChange={setVerified}
      onRemove={removeVerifiedFilter}
      optionLabel={t('Service.OpenctiIntegrations.Filter.Verified.Label')}
    />
  );
};
