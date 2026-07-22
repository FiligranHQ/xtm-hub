import GuardCapacityComponent from '@/components/AdminGuard';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { getTranslations } from 'next-intl/server';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Settings',
  },
  {
    label: 'MenuLinks.SolutionCategory',
  },
];

export const dynamic = 'force-dynamic';

const Page = async () => {
  const t = await getTranslations();

  return (
    <GuardCapacityComponent displayError>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="sr-only">{t('MenuLinks.SolutionCategory')}</h1>
      <SolutionCategories />
    </GuardCapacityComponent>
  );
};

export default Page;
