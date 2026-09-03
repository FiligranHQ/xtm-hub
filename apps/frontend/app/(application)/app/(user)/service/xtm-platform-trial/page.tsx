import { PrivateXtmPlatformTrialPanel } from '@/components/service/trial-instances/xtm-platform-trial/PrivateXtmPlatformTrialPanel';
import { XtmPlatformTrialPage } from '@/components/service/trial-instances/xtm-platform-trial/XtmPlatformTrialPage';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { getAuthenticatedGraphqlClient } from '@/lib/graphql-client';
import { UnauthenticatedError } from '@/lib/graphql-fetch.utils';
import { APP_PATH, xtmPlatformTrialBundlePath } from '@/utils/path/constant';
import { isFeatureEnabled } from '@/utils/settings.service';
import {
  FeatureFlag,
  useActiveXtmPlatformBundleQuery,
} from '@graphql/generated';
import { getTranslations } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';

const loadActiveBundleServiceInstanceId = async () => {
  try {
    const authenticatedClient = await getAuthenticatedGraphqlClient();
    const activeBundleData = await useActiveXtmPlatformBundleQuery.fetcher(
      authenticatedClient,
      { serviceInstanceId: null }
    )();
    return (
      activeBundleData.activeXtmPlatformBundle?.service_instance_id ?? null
    );
  } catch (error) {
    if (
      error instanceof UnauthenticatedError ||
      (error instanceof Error && error.message === 'UNAUTHENTICATED')
    ) {
      throw error;
    }
    console.error('Failed to fetch active XTM Platform bundle:', error);
    return null;
  }
};

const Page = async () => {
  const xtmPlatformTrialEnabled = await isFeatureEnabled(
    FeatureFlag.XtmPlatformTrial
  );
  if (!xtmPlatformTrialEnabled) {
    return notFound();
  }
  const activeBundleServiceInstanceId =
    await loadActiveBundleServiceInstanceId();
  if (activeBundleServiceInstanceId) {
    redirect(xtmPlatformTrialBundlePath(String(activeBundleServiceInstanceId)));
  }

  const t = await getTranslations();

  const breadcrumbs = [
    {
      label: 'MenuLinks.Home',
      href: `/${APP_PATH}`,
    },
    {
      label: t('Service.Trials.XtmPlatform.Page.Breadcrumb'),
      original: true,
    },
  ];

  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />
      <XtmPlatformTrialPage
        panel={<PrivateXtmPlatformTrialPanel />}
        showLimitations
      />
    </>
  );
};

export default Page;
