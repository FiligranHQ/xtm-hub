import CompetitorList from '@/components/competitor/competitor-list';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { useTranslations } from 'next-intl';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Settings',
  },
  {
    label: 'MenuLinks.Competitors',
  },
];
const PageLoader = () => {
  const t = useTranslations();
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="sr-only">{t('MenuLinks.Competitors')}</h1>
      <CompetitorList />
    </>
  );
};

// Component export
export default PageLoader;
