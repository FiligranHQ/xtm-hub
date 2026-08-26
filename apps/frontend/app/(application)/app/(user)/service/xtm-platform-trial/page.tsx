import { PrivateXtmPlatformTrialPanel } from '@/components/service/trial-instances/xtm-platform-trial/PrivateXtmPlatformTrialPanel';
import { XtmPlatformTrialPage } from '@/components/service/trial-instances/xtm-platform-trial/XtmPlatformTrialPage';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { APP_PATH } from '@/utils/path/constant';
import { isFeatureEnabled } from '@/utils/settings.service';
import { FeatureFlag } from '@graphql/generated';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

const Page = async () => {
  const xtmPlatformTrialEnabled = await isFeatureEnabled(
    FeatureFlag.XtmPlatformTrial
  );
  if (!xtmPlatformTrialEnabled) {
    notFound();
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
