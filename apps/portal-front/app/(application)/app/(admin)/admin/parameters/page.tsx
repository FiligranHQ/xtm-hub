'use client';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { Parameters } from '../../../../../../src/components/admin/parameters/Parameters';
import GuardCapacityComponent from '../../../../../../src/components/AdminGuard';
import { BreadcrumbNav } from '../../../../../../src/components/ui/BreadcrumbNav';

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
      <h1 className="sr-only">{t('MenuLinks.Parameters')}</h1>
      <Parameters />
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
