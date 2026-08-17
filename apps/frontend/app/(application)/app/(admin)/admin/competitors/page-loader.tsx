import CompetitorList from '@/components/competitor/CompetitorList';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { useTranslate } from '@tolgee/react';

const breadcrumbValue = [
  {
    label: 'MenuLinks_Settings',
  },
  {
    label: 'MenuLinks_Competitor',
  },
];
const PageLoader = () => {
  const { t } = useTranslate();
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="sr-only">{t('MenuLinks_Competitor')}</h1>
      <CompetitorList />
    </>
  );
};

// Component export
export default PageLoader;
