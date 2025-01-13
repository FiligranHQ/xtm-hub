import OrganizationList from '@/components/organization/organization-list';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { useTranslations } from 'next-intl';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Settings',
  },
  {
    label: 'MenuLinks.Organizations',
  },
];
const PageLoader = () => {
  const t = useTranslations();
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="pb-s">{t('MenuLinks.Organizations')}</h1>
      <OrganizationList />
    </>
  );
};

// Component export
export default PageLoader;
