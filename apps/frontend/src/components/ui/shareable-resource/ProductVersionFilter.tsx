import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import { useServiceListLocalStorageKeyContext } from '@/components/service/components/ServiceListLocalStorageKeyContext';
import { LogicalMultiSelectFormField } from '@/components/ui/shareable-resource/logical-multi-select/LogicalMultiSelectFormField';
import { useRegisteredPlatforms } from '@/hooks/use-registered-platforms';
import { useServiceListFilters } from '@/hooks/use-service-list-filters';
import { useServiceListLocalStorage } from '@/hooks/use-service-list-local-storage';
import { PlatformIdentifier } from '@graphql/generated';
import { useMemo } from 'react';

import { useTranslate } from '@tolgee/react';
interface ProductVersionFilterProps {
  platformIdentifier: PlatformIdentifier;
}

export const ProductVersionFilter = ({
  platformIdentifier,
}: ProductVersionFilterProps) => {
  const { t } = useTranslate();
  const { platforms } = useRegisteredPlatforms(platformIdentifier, {
    onlyActive: true,
  });

  const options = useMemo(() => {
    return platforms
      .map((platform) => ({
        label: platform.title,
        value: platform.version,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [platforms]);

  const { localStorageKey } = useServiceListLocalStorageKeyContext();
  const { productVersions, setProductVersions, removeProductVersions } =
    useServiceListLocalStorage(localStorageKey);

  const { removeFilter } = useServiceListFilters();
  const removeProductVersionsFilter = () => {
    removeProductVersions();
    removeFilter(ServiceListFilterKey.ProductVersion);
  };

  return (
    <LogicalMultiSelectFormField
      options={options}
      initialValue={productVersions}
      placeholder={t(
        'Service_OpenctiIntegrations_Filter_ProductVersion_Placeholder'
      )}
      noResultString={t('Utils_NotFound')}
      onValueChange={setProductVersions}
      onRemove={removeProductVersionsFilter}
      optionLabel={t('Service_OpenctiIntegrations_Filter_ProductVersion_Label')}
    />
  );
};
