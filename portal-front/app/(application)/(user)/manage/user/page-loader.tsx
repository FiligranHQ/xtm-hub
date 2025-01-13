'use client';

import UserList from '@/components/admin/user/user-list';
import { Portal, portalContext } from '@/components/portal-context';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useContext } from 'react';

// Component interface
interface PreloaderProps {}

const breadcrumbValue = [
  {
    label: 'MenuLinks.Home',
    href: '/',
  },
  {
    label: 'MenuLinks.Users',
  },
];

// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = () => {
  const t = useTranslations();
  const { me } = useContext<Portal>(portalContext);

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="pb-s">{t('UserListPage.Title')}</h1>
      <UserList organization={me?.selected_organization_id} />
    </>
  );
};

// Component export
export default PageLoader;
