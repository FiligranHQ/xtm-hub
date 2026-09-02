'use client';

import { PrivateXtmPlatformTrialPanel } from '@/components/service/trial-instances/xtm-platform-trial/PrivateXtmPlatformTrialPanel';
import { XtmPlatformTrialPage as XtmPlatformTrialPitchPage } from '@/components/service/trial-instances/xtm-platform-trial/XtmPlatformTrialPage';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { XtmPlatformTrialPage as XtmPlatformTrialBundlePage } from '@/components/xtm-platform-trial/XtmPlatformTrialPage';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { APP_PATH } from '@/utils/path/constant';
import { xtmPlatformBundleKeys } from '@graphql/deployment/deployment.keys';
import { useActiveXtmPlatformBundleQuery } from '@graphql/generated';

const breadcrumbs = [
  {
    label: 'MenuLinks.Home',
    href: `/${APP_PATH}`,
  },
  {
    label: 'Service.Trials.XtmPlatform.Page.Breadcrumb',
  },
];

const PageLoader = () => {
  const { data, isLoading } = useActiveXtmPlatformBundleQuery(
    portalGraphqlClient,
    undefined,
    {
      queryKey: xtmPlatformBundleKeys.activeXtmPlatformBundle(),
    }
  );

  if (isLoading) {
    return null;
  }

  const bundle = data?.activeXtmPlatformBundle;

  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />
      {bundle ? (
        <XtmPlatformTrialBundlePage
          serviceInstanceId={bundle.service_instance_id}
        />
      ) : (
        <XtmPlatformTrialPitchPage
          panel={<PrivateXtmPlatformTrialPanel />}
          showLimitations
        />
      )}
    </>
  );
};

export default PageLoader;
