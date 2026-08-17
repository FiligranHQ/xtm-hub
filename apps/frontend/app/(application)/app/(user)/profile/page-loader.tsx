'use client';

import { Profile } from '@/components/profile';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { APP_PATH } from '@/utils/path/constant';

const breadcrumbValue = [
  {
    label: 'MenuLinks_Home',
    href: `/${APP_PATH}`,
  },
  {
    label: 'MenuLinks_Profile',
  },
];

const PageLoader = () => {
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <Profile />
    </>
  );
};

// Component export
export default PageLoader;
