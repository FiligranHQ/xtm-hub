'use client';

import { Profile } from '@/components/profile';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { APP_PATH } from '@/utils/path/constant';
import * as React from 'react';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Home',
    href: `/${APP_PATH}`,
  },
  {
    label: 'MenuLinks.Profile',
  },
];

const PageLoader: React.FunctionComponent = () => {
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <Profile />
    </>
  );
};

// Component export
export default PageLoader;
