'use client';
import { Parameters } from '@/components/admin/parameters/Parameters';
import GuardCapacityComponent from '@/components/AdminGuard';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { useTranslations } from 'next-intl';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Settings',
  },
  {
    label: 'MenuLinks.Parameters',
  },
];

// Component
const Page = () => {
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
