'use client';

import UserListPage from '@/components/admin/user/user-list-page';
import { PortalContext } from '@/components/me/app-portal-context';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { APP_PATH } from '@/utils/path/constant';
import * as React from 'react';
import { useContext } from 'react';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Home',
    href: `/${APP_PATH}`,
  },
  {
    label: 'MenuLinks.Users',
  },
];

// Component
const PageLoader: React.FunctionComponent = () => {
  const { me } = useContext(PortalContext);

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <UserListPage organization={me?.selected_organization_id} />
    </>
  );
};

// Component export
export default PageLoader;
