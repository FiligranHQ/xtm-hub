import BlueBlurDecoration from '@/components/homepage/BlueBlurDecoration';
import { buildDistinctPlatformIdentifiersFromServiceDefinition } from '@/components/homepage/Homepage.utils';
import LastDeployedResourcesSection from '@/components/homepage/last-deployed-resources/LastDeployedResourcesSection';
import PendingUserRedirectErrorToast from '@/components/homepage/PendingUserRedirectErrorToast';
import { RegisteredPlatformsSection } from '@/components/homepage/registered-platforms/RegisteredPlatformsSection';
import MostDeployedResources from '@/components/homepage/resources/MostDeployedResources';
import NewestResources from '@/components/homepage/resources/NewestResources';
import PrivateHomepageRoadmapSection from '@/components/homepage/roadmap/PrivateHomepageRoadmapSection';
import ThreadConferenceBanner from '@/components/homepage/ThreadConferenceBanner';
import XtmPlatform from '@/components/homepage/xtm-platform/XtmPlatform';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { getAuthenticatedGraphqlClient } from '@/lib/graphql-client';
import { APP_PATH } from '@/utils/path/constant';
import {
  useMeFirstNameQuery,
  useRegisteredPlatformsQuery,
} from '@graphql/generated';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Home',
    href: `/${APP_PATH}`,
  },
];

export const PrivateHomepage = async () => {
  const authenticatedClient = await getAuthenticatedGraphqlClient();

  const [registeredPlatformsData, deployedPlatformsData, meData] =
    await Promise.all([
      useRegisteredPlatformsQuery.fetcher(authenticatedClient, {
        input: {
          identifier: null,
          onlyActive: true,
          onlyTrial: null,
          hasDeployedResources: null,
        },
      })(),
      useRegisteredPlatformsQuery.fetcher(authenticatedClient, {
        input: {
          identifier: null,
          onlyActive: true,
          onlyTrial: null,
          hasDeployedResources: true,
        },
      })(),
      useMeFirstNameQuery.fetcher(authenticatedClient, {})(),
    ]);

  const platformIdentifiers =
    buildDistinctPlatformIdentifiersFromServiceDefinition(
      registeredPlatformsData.registeredPlatforms
    );

  const welcomeName = meData.me?.first_name?.trim() || undefined;

  return (
    <>
      <BlueBlurDecoration />
      <PendingUserRedirectErrorToast />
      {platformIdentifiers.length !== 0 && (
        <BreadcrumbNav value={breadcrumbValue} />
      )}
      <div className="p-0 sm:p-xl flex flex-col gap-xl">
        {platformIdentifiers.length === 0 ? (
          <XtmPlatform welcomeName={welcomeName} />
        ) : (
          <div className="flex flex-col xl:flex-row gap-xl items-start">
            <RegisteredPlatformsSection
              welcomeName={welcomeName}
              registeredPlatformsData={registeredPlatformsData}
            />
            <LastDeployedResourcesSection
              registeredPlatformsData={deployedPlatformsData}
            />
          </div>
        )}
        <ThreadConferenceBanner />
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
