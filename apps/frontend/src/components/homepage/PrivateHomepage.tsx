import MostDeployedResources from '@/components/homepage/MostDeployedResources';
import { ServiceDefinitionIdentifierToPlatformIdentifier } from '@/components/registration/platform-identifier-mapping';
import { defaultLocale, publicLocales } from '@/i18n/config';
import { getAuthenticatedGraphqlClient } from '@/lib/graphql-client';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import {
  ServiceDefinitionIdentifier,
  useRegisteredPlatformsQuery,
} from '@graphql/generated';
import { getLocale } from 'next-intl/server';

const resolveHomepagePlatformIdentifiers = (
  registeredIdentifiers: ServiceDefinitionIdentifier[]
): PlatformIdentifierEnum[] | undefined => {
  const platformSet = new Set<PlatformIdentifierEnum>();
  for (const identifier of registeredIdentifiers) {
    // Both enums are generated from the same GraphQL schema and share identical string values
    const platform =
      ServiceDefinitionIdentifierToPlatformIdentifier[
        identifier as unknown as ServiceDefinitionIdentifierEnum
      ];
    if (platform) {
      platformSet.add(platform);
    }
  }
  return platformSet.size === 1 ? [...platformSet] : undefined;
};

export const PrivateHomepage = async () => {
  const userLocale = await getLocale();
  const locale = (publicLocales as readonly string[]).includes(userLocale)
    ? (userLocale as (typeof publicLocales)[number])
    : defaultLocale;

  const authenticatedClient = await getAuthenticatedGraphqlClient();

  const registeredPlatformsData = await useRegisteredPlatformsQuery.fetcher(
    authenticatedClient,
    {
      input: { identifier: null, onlyActive: null, onlyTrial: null },
    }
  )();

  const platformIdentifiers = resolveHomepagePlatformIdentifiers(
    registeredPlatformsData.registeredPlatforms.map((p) => p.identifier)
  );

  return (
    <div className="p-xl">
      <MostDeployedResources
        locale={locale}
        platformIdentifiers={platformIdentifiers}
      />
    </div>
  );
};
