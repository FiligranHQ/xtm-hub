import { buildDistinctPlatformIdentifiersFromServiceDefinition } from '@/components/homepage/Homepage.utils';
import { RegisteredPlatformsSection } from '@/components/homepage/registered-platforms/RegisteredPlatformsSection';
import MostDeployedResources from '@/components/homepage/resources/MostDeployedResources';
import NewestResources from '@/components/homepage/resources/NewestResources';
import PrivateHomepageRoadmapSection from '@/components/homepage/roadmap/PrivateHomepageRoadmapSection';
import XtmPlatform from '@/components/homepage/xtm-platform/XtmPlatform';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { getAuthenticatedGraphqlClient } from '@/lib/graphql-client';
import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import { APP_PATH } from '@/utils/path/constant';
import MeLoaderQuery, { meLoaderQuery } from '@generated/meLoaderQuery.graphql';
import { useRegisteredPlatformsQuery } from '@graphql/generated';

type MeNameData = {
  first_name?: string | null;
  last_name?: string | null;
};

const breadcrumbValue = [
  {
    label: 'MenuLinks.Home',
    href: `/${APP_PATH}`,
  },
];

export const PrivateHomepage = async () => {
  const authenticatedClient = await getAuthenticatedGraphqlClient();

  const [registeredPlatformsData, meData] = await Promise.all([
    useRegisteredPlatformsQuery.fetcher(authenticatedClient, {
      input: { identifier: null, onlyActive: true, onlyTrial: null },
    })(),
    serverFetchGraphQL<meLoaderQuery>(MeLoaderQuery),
  ]);

  const platformIdentifiers =
    buildDistinctPlatformIdentifiersFromServiceDefinition(
      registeredPlatformsData.registeredPlatforms
    );

  const me = meData.data.me as MeNameData | null | undefined;
  const firstName = me?.first_name?.trim() ?? '';
  const lastName = me?.last_name?.trim() ?? '';

  const welcomeName = `${firstName} ${lastName}`.trim() || undefined;

  return (
    <>
      {platformIdentifiers.length !== 0 && (
        <BreadcrumbNav value={breadcrumbValue} />
      )}
      <div className="p-xl flex flex-col gap-xl">
        {platformIdentifiers.length === 0 && (
          <XtmPlatform welcomeName={welcomeName} />
        )}
        <RegisteredPlatformsSection
          welcomeName={welcomeName}
          registeredPlatformsData={registeredPlatformsData}
        />
        <PrivateHomepageRoadmapSection
          platformIdentifiers={platformIdentifiers}
        />
        <NewestResources
          platformIdentifiers={platformIdentifiers}
          isAuthenticated={true}
        />
        <MostDeployedResources
          platformIdentifiers={platformIdentifiers}
          isAuthenticated={true}
        />
      </div>
    </>
  );
};
