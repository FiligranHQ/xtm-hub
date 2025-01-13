'use client';

import UserList from '@/components/admin/user/user-list';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { useTranslations } from 'next-intl';
import * as React from 'react';

// Component interface
interface PreloaderProps {}

const breadcrumbValue = [
  {
    label: 'MenuLinks.Settings',
  },
  {
    label: 'MenuLinks.Users',
  },
];
// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = () => {
  const t = useTranslations();

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="pb-s">{t('MenuLinks.Users')}</h1>
      <UserList />
    </>
  );
};

// Component export
export default PageLoader;
