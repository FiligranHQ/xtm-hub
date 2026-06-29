import { resolveHomepagePlatformIdentifiers } from '@/components/homepage/Homepage.utils';
import MostDeployedResources from '@/components/homepage/MostDeployedResources';
import NewestResources from '@/components/homepage/NewestResources';
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
      input: { identifier: null, onlyActive: null, onlyTrial: null },
    }
  )();

  const platformIdentifiers = resolveHomepagePlatformIdentifiers(
    registeredPlatformsData.registeredPlatforms.map((p) => p.identifier)
  );

  return (
    <div className="p-xl flex flex-col gap-xl">
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
