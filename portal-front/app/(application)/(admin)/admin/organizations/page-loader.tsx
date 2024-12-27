import { AdminCallout } from '@/components/admin/admin-callout';
import OrganizationList from '@/components/organization/organization-list';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { UseTranslationsProps } from '@/i18n/config';
import { useTranslations } from 'next-intl';

const breadcrumbValue = (t: UseTranslationsProps) => [
  {
    label: t('MenuLinks.Settings'),
  },
  {
    label: t('MenuLinks.Organizations'),
  },
];
const PageLoader = () => {
  const t = useTranslations();
  return (
    <>
      <AdminCallout />
      <BreadcrumbNav value={breadcrumbValue(t)} />
      <h1 className="pb-s">{t('MenuLinks.Organizations')}</h1>
      <OrganizationList />
    </>
  );
};

// Component export
export default PageLoader;
