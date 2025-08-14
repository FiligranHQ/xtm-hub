'use client';

import UserListPage from '@/components/admin/user/user-list-page';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { useTranslations } from 'next-intl';
import * as React from 'react';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Settings',
  },
  {
    label: 'MenuLinks.Security',
  },
];
// Component
const PageLoader: React.FunctionComponent = () => {
  const t = useTranslations();

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="sr-only">{t('MenuLinks.Security')}</h1>
      <UserListPage />
    </>
  );
};

// Component export
export default PageLoader;
