'use client';

import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { XtmPlatformTrialPage } from '@/components/xtm-platform-trial/XtmPlatformTrialPage';
import { APP_PATH } from '@/utils/path/constant';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Home',
    href: `/${APP_PATH}`,
  },
  {
    label: 'Menu.XTMPlatformTrial',
  },
];

const PageLoader = ({ serviceInstanceId }: { serviceInstanceId: string }) => {
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <XtmPlatformTrialPage serviceInstanceId={serviceInstanceId} />
    </>
  );
};

export default PageLoader;
