'use client';

import { AdminCallout } from '@/components/admin/admin-callout';
import UserList from '@/components/admin/user/user-list';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { UseTranslationsProps } from '@/i18n/config';
import { useTranslations } from 'next-intl';
import * as React from 'react';

// Component interface
interface PreloaderProps {}

const breadcrumbValue = (t: UseTranslationsProps) => [
  {
    label: t('MenuLinks.Settings'),
  },
  {
    label: t('MenuLinks.Users'),
  },
];
// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = () => {
  const t = useTranslations();

  return (
    <>
      <AdminCallout />
      <BreadcrumbNav value={breadcrumbValue(t)} />
      <h1 className="pb-s">{t('MenuLinks.Users')}</h1>
      <UserList />
    </>
  );
};

// Component export
export default PageLoader;
