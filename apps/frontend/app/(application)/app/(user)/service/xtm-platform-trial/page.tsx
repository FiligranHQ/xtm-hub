import { XtmPlatformTrialPage } from '@/components/service/trial-instances/xtm-platform-trial/XtmPlatformTrialPage';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { APP_PATH } from '@/utils/path/constant';
import { getTranslations } from 'next-intl/server';

const Page = async () => {
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
      <XtmPlatformTrialPage panel={null} />
    </>
  );
};

export default Page;
