'use client';
import GuardCapacityComponent from '@/components/admin-guard';
import Labels from '@/components/admin/label/labels';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { useTranslations } from 'next-intl';
import * as React from 'react';

export const dynamic = 'force-dynamic';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Settings',
  },
  {
    label: 'MenuLinks.Labels',
  },
];

// Component
const Page: React.FunctionComponent = () => {
  const t = useTranslations();

  return (
    <GuardCapacityComponent displayError>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="pb-s">{t('MenuLinks.Labels')}</h1>
      <Labels />
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
