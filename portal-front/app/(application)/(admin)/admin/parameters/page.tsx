'use client';
import GuardCapacityComponent from '@/components/admin-guard';
import { Parameters } from '@/components/admin/parameters/parameters';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { useTranslations } from 'next-intl';
import * as React from 'react';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Settings',
  },
  {
    label: 'MenuLinks.Parameters',
  },
];

// Component
const Page: React.FunctionComponent = () => {
  const t = useTranslations();

  return (
    <GuardCapacityComponent displayError>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="pb-s">{t('MenuLinks.Parameters')}</h1>
      <Parameters />
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
