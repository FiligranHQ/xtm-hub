'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import UserListPage from '../../../../../../src/components/admin/user/UserListPage';
import { BreadcrumbNav } from '../../../../../../src/components/ui/BreadcrumbNav';

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
