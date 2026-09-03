import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import { useServiceListLocalStorageKeyContext } from '@/components/service/components/ServiceListLocalStorageKeyContext';
import { LogicalMultiSelectFormField } from '@/components/ui/shareable-resource/logical-multi-select/LogicalMultiSelectFormField';
import { useRegisteredPlatforms } from '@/hooks/use-registered-platforms';
import { useServiceListFilters } from '@/hooks/use-service-list-filters';
import { useServiceListLocalStorage } from '@/hooks/use-service-list-local-storage';
import { PlatformIdentifier } from '@graphql/generated';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

interface ProductVersionFilterProps {
  platformIdentifier: PlatformIdentifier;
  /**
   * On public pages there is no authenticated user/organization, so the
   * registered-instance lookup must be skipped entirely.
   */
  publicPath?: boolean;
}

export const ProductVersionFilter = ({
  platformIdentifier,
  publicPath = false,
}: ProductVersionFilterProps) => {
  const t = useTranslations();
  const { platforms } = useRegisteredPlatforms(platformIdentifier, {
    onlyActive: true,
    skip: publicPath,
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
        'Service.OpenctiIntegrations.Filter.ProductVersion.Placeholder'
      )}
      noResultString={t('Utils.NotFound')}
      onValueChange={setProductVersions}
      onRemove={removeProductVersionsFilter}
      optionLabel={t('Service.OpenctiIntegrations.Filter.ProductVersion.Label')}
    />
  );
};
