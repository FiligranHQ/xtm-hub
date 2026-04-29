'use client';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import UseCases from '@/components/admin/use-case/UseCases';
import GuardCapacityComponent from '@/components/AdminGuard';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';

export const dynamic = 'force-dynamic';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Settings',
  },
  {
    label: 'MenuLinks.UseCases',
  },
];

// Component
const Page: React.FunctionComponent = () => {
  const t = useTranslations();

  return (
    <GuardCapacityComponent displayError>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="sr-only">{t('MenuLinks.UseCases')}</h1>
      <UseCases />
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
