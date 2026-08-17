import OrganizationList from '@/components/organization/OrganizationList';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { useTranslate } from '@tolgee/react';

const breadcrumbValue = [
  {
    label: 'MenuLinks_Settings',
  },
  {
    label: 'MenuLinks_Organization',
  },
];
const PageLoader = () => {
  const { t } = useTranslate();
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="sr-only">{t('MenuLinks_Organization')}</h1>
      <OrganizationList />
    </>
  );
};

// Component export
export default PageLoader;
