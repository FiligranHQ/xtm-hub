'use client';

import { APP_PATH } from '@/utils/path/constant';
import * as React from 'react';
import { useContext } from 'react';
import UserListPage from '../../../../../../src/components/admin/user/UserListPage';
import { PortalContext } from '../../../../../../src/components/me/AppPortalContext';
import { BreadcrumbNav } from '../../../../../../src/components/ui/BreadcrumbNav';

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
