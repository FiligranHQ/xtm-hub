'use client';

import UserListPage from '@/components/admin/user/UserListPage';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { useTranslations } from 'next-intl';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Settings',
  },
  {
    label: 'MenuLinks.Security',
  },
];
// Component
const PageLoader = () => {
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
