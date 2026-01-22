import { ServiceListFilterContainer } from '@/components/service/components/header/filter/service-list-filter-container';
import { useServiceListLocalStorageKeyContext } from '@/components/service/components/service-list-local-storage-key-context';
import { useServiceListLocalStorage } from '@/components/service/components/use-service-list-local-storage';
import { useRegisteredPlatforms } from '@/hooks/useRegisteredPlatforms';
import { MultiSelectFormField } from '@filigran/ui';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';

interface Props {
  platformIdentifier: PlatformIdentifierEnum;
}

export const ProductVersionFilter: React.FC<Props> = ({
  platformIdentifier,
}) => {
  const t = useTranslations();
  const { platforms } = useRegisteredPlatforms(platformIdentifier);

  const options = useMemo(() => {
    return platforms
      .map((platform) => ({
        label: platform.title,
        value: platform.version,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [platforms]);

  const { localStorageKey } = useServiceListLocalStorageKeyContext();
  const { productVersions, setProductVersions } =
    useServiceListLocalStorage(localStorageKey);

  return (
    <ServiceListFilterContainer>
      <MultiSelectFormField
        options={options}
        defaultValue={productVersions}
        placeholder={t(
          'Service.OpenctiIntegrations.Filter.ProductVersion.Placeholder'
        )}
        noResultString={t('Utils.NotFound')}
        onValueChange={setProductVersions}
        variant="inverted"
      />
    </ServiceListFilterContainer>
  );
};
