import { resolveHomepagePlatformIdentifiers } from '@/components/homepage/Homepage.utils';
import MostDeployedResources from '@/components/homepage/MostDeployedResources';
import NewestResources from '@/components/homepage/NewestResources';
import PrivateHomepageRoadmapSection from '@/components/homepage/PrivateHomepageRoadmapSection';
import { defaultLocale, publicLocales } from '@/i18n/config';
import { getAuthenticatedGraphqlClient } from '@/lib/graphql-client';
import { useRegisteredPlatformsQuery } from '@graphql/generated';
import { getLocale } from 'next-intl/server';

export const PrivateHomepage = async () => {
  const userLocale = await getLocale();
  const locale = (publicLocales as readonly string[]).includes(userLocale)
    ? (userLocale as (typeof publicLocales)[number])
    : defaultLocale;

  const authenticatedClient = await getAuthenticatedGraphqlClient();

  const registeredPlatformsData = await useRegisteredPlatformsQuery.fetcher(
    authenticatedClient,
    {
      input: { identifier: null, onlyActive: true, onlyTrial: null },
    }
  )();

  const registeredIdentifiers = registeredPlatformsData.registeredPlatforms.map(
    (platform) => platform.identifier
  );

  const platformIdentifiers = resolveHomepagePlatformIdentifiers(
    registeredIdentifiers
  );

  return (
    <div className="p-xl flex flex-col gap-xl">
      <PrivateHomepageRoadmapSection
        locale={locale}
        registeredIdentifiers={registeredIdentifiers}
      />
      <NewestResources
        locale={locale}
        platformIdentifiers={platformIdentifiers}
        isAuthenticated={true}
      />
      <MostDeployedResources
        locale={locale}
        platformIdentifiers={platformIdentifiers}
        isAuthenticated={true}
      />
    </div>
  );
};
