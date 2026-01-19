import { useServiceListLocalStorageKeyContext } from '@/components/service/components/service-list-local-storage-key-context';
import { useServiceListLocalStorage } from '@/components/service/components/use-service-list-local-storage';
import { LogicalMultiSelectFormField } from '@/components/ui/shareable-resource/logical-multi-select-form-field';
import { useRegisteredPlatforms } from '@/hooks/useRegisteredPlatforms';
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
    <LogicalMultiSelectFormField
      options={options}
      initialValue={productVersions}
      placeholder={t(
        'Service.OpenctiIntegrations.Filter.ProductVersion.Placeholder'
      )}
      noResultString={t('Utils.NotFound')}
      onValueChange={setProductVersions}
      optionLabel={t('Service.OpenctiIntegrations.Filter.ProductVersion.Label')}
    />
  );
};
