import { ServiceListFilterContainer } from '@/components/service/components/header/filter/service-list-filter-container';
import { useServiceListLocalStorageKeyContext } from '@/components/service/components/service-list-local-storage-key-context';
import { useServiceListLocalStorage } from '@/components/service/components/use-service-list-local-storage';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { productVersionFilterRegisteredPlatformFragment$key } from '@generated/productVersionFilterRegisteredPlatformFragment.graphql';
import { productVersionFilterRegisteredPlatformsQuery } from '@generated/productVersionFilterRegisteredPlatformsQuery.graphql';
import { MultiSelectFormField } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface Props {
  platformIdentifier: PlatformIdentifierEnum;
}

export const ProductVersionFilterRegisteredPlatformFragment = graphql`
  fragment productVersionFilterRegisteredPlatformFragment on RegisteredPlatform {
    id
    version
    title
  }
`;

export const ProductVersionFilterRegisteredPlatformsQuery = graphql`
  query productVersionFilterRegisteredPlatformsQuery(
    $input: RegisteredPlatformsInput!
  ) {
    registeredPlatforms(input: $input) {
      ...productVersionFilterRegisteredPlatformFragment
    }
  }
`;

export const ProductVersionFilter: React.FC<Props> = ({
  platformIdentifier,
}) => {
  const t = useTranslations();
  const queryData =
    useLazyLoadQuery<productVersionFilterRegisteredPlatformsQuery>(
      ProductVersionFilterRegisteredPlatformsQuery,
      {
        input: {
          identifier: platformIdentifier,
        },
      }
    );
  const platforms = queryData.registeredPlatforms.map((instanceRef) =>
    useFragment<productVersionFilterRegisteredPlatformFragment$key>(
      ProductVersionFilterRegisteredPlatformFragment,
      instanceRef
    )
  );

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
          'Service.OpenctiIntegrationFeeds.Filter.Type.Placeholder'
        )}
        noResultString={t('Utils.NotFound')}
        onValueChange={setProductVersions}
        variant="inverted"
      />
    </ServiceListFilterContainer>
  );
};
