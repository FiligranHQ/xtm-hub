'use client';

import { Profile } from '@/components/profile';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import * as React from 'react';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Home',
    href: '/app',
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
