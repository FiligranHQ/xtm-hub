'use client';
import GuardCapacityComponent from '@/components/admin-guard';
import { Parameters } from '@/components/admin/parameters/parameters';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { UseTranslationsProps } from '@/i18n/config';
import { RESTRICTION } from '@/utils/constant';
import { useTranslations } from 'next-intl';
import * as React from 'react';

interface PageProps {}

// Component
const Page: React.FunctionComponent<PageProps> = () => {
  const t = useTranslations();

  const breadcrumbValue = (t: UseTranslationsProps) => [
    {
      label: t('MenuLinks.Settings'),
    },
    {
      label: t('MenuLinks.Parameters'),
    },
  ];

  return (
    <GuardCapacityComponent
      displayError
      capacityRestriction={[RESTRICTION.CAPABILITY_BYPASS]}>
      <BreadcrumbNav value={breadcrumbValue(t)} />
      <h1 className="pb-s">{t('MenuLinks.Parameters')}</h1>
      <Parameters />
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
