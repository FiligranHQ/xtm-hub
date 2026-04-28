import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import { useRegisteredPlatforms } from '../../../hooks/use-registered-platforms';
import { useServiceListFilters } from '../../../hooks/use-service-list-filters';
import { useServiceListLocalStorage } from '../../../hooks/use-service-list-local-storage';
import { ServiceListFilterKey } from '../../service/components/header/ServiceListHeader';
import { useServiceListLocalStorageKeyContext } from '../../service/components/ServiceListLocalStorageKeyContext';
import { LogicalMultiSelectFormField } from './logical-multi-select/LogicalMultiSelectFormField';

interface Props {
  platformIdentifier: PlatformIdentifierEnum;
}

export const ProductVersionFilter: React.FC<Props> = ({
  platformIdentifier,
}) => {
  const t = useTranslations();
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
        'Service.OpenctiIntegrations.Filter.ProductVersion.Placeholder'
      )}
      noResultString={t('Utils.NotFound')}
      onValueChange={setProductVersions}
      onRemove={removeProductVersionsFilter}
      optionLabel={t('Service.OpenctiIntegrations.Filter.ProductVersion.Label')}
    />
  );
};
