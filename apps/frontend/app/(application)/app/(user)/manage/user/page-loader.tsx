'use client';

import UserListPage from '@/components/admin/user/UserListPage';
import { PortalContext } from '@/components/me/AppPortalContext';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { APP_PATH } from '@/utils/path/constant';
import { useContext } from 'react';

const breadcrumbValue = [
  {
    label: 'MenuLinks_Home',
    href: `/${APP_PATH}`,
  },
  {
    label: 'MenuLinks_Users',
  },
];

// Component
const PageLoader = () => {
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
