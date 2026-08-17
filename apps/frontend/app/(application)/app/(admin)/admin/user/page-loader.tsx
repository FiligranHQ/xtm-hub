'use client';
import UserListPage from '@/components/admin/user/UserListPage';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';

import { useTranslate } from '@tolgee/react';

const breadcrumbValue = [
  {
    label: 'MenuLinks_Settings',
  },
  {
    label: 'MenuLinks_Security',
  },
];
// Component
const PageLoader = () => {
  const { t } = useTranslate();

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="sr-only">{t('MenuLinks_Security')}</h1>
      <UserListPage />
    </>
  );
};

// Component export
export default PageLoader;
