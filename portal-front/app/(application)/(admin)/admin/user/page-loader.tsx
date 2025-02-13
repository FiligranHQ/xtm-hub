'use client';

import UserList from '@/components/admin/user/user-list';
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
      <h1 className="pb-s">{t('MenuLinks.Security')}</h1>
      <UserList />
    </>
  );
};

// Component export
export default PageLoader;
