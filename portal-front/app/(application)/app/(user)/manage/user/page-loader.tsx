'use client';

import UserList from '@/components/admin/user/user-list';
import { PortalContext } from '@/components/me/app-portal-context';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useContext } from 'react';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Home',
    href: '/app',
  },
  {
    label: 'MenuLinks.Users',
  },
];

// Component
const PageLoader: React.FunctionComponent = () => {
  const t = useTranslations();
  const { me } = useContext(PortalContext);

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="sr-only">{t('UserListPage.Title')}</h1>
      <UserList organization={me?.selected_organization_id} />
    </>
  );
};

// Component export
export default PageLoader;
