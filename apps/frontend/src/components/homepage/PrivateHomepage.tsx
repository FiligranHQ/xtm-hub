import { resolveHomepagePlatformIdentifiers } from '@/components/homepage/Homepage.utils';
import MostDeployedResources from '@/components/homepage/MostDeployedResources';
import NewestResources from '@/components/homepage/NewestResources';
import PrivateHomepageRoadmapSection from '@/components/homepage/PrivateHomepageRoadmapSection';
import XtmPlatform from '@/components/homepage/XtmPlatform';
import { defaultLocale, publicLocales } from '@/i18n/config';
import { getAuthenticatedGraphqlClient } from '@/lib/graphql-client';
import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import MeLoaderQuery, { meLoaderQuery } from '@generated/meLoaderQuery.graphql';
import { useRegisteredPlatformsQuery } from '@graphql/generated';
import { getLocale } from 'next-intl/server';

type MeNameData = {
  first_name?: string | null;
  last_name?: string | null;
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
      input: { identifier: null, onlyActive: true, onlyTrial: null },
    }
  )();

  const registeredIdentifiers = registeredPlatformsData.registeredPlatforms.map(
    (platform) => platform.identifier
  );

  const platformIdentifiers = resolveHomepagePlatformIdentifiers(
    registeredIdentifiers
  );

  let welcomeName: string | undefined;

  if (registeredIdentifiers.length === 0) {
    const meData = await serverFetchGraphQL<meLoaderQuery>(MeLoaderQuery);
    const me = meData.data.me as MeNameData | null | undefined;
    const firstName = me?.first_name?.trim() ?? '';
    const lastName = me?.last_name?.trim() ?? '';

    welcomeName = `${firstName} ${lastName}`.trim() || undefined;
  }

  return (
    <div className="p-xl flex flex-col gap-xl">
      {registeredIdentifiers.length === 0 && (
        <XtmPlatform welcomeName={welcomeName} />
      )}
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
