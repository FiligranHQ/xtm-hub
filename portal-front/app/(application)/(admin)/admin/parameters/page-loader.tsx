import { Parameters } from '@/components/admin/parameters/parameters';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { UseTranslationsProps } from '@/i18n/config';
import { useTranslations } from 'next-intl';

const breadcrumbValue = (t: UseTranslationsProps) => [
  {
    label: t('MenuLinks.Settings'),
  },
  {
    label: t('MenuLinks.Parameters'),
  },
];
const PageLoader = () => {
  const t = useTranslations();
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue(t)} />
      <h1 className="pb-s">{t('MenuLinks.Parameters')}</h1>
      <Parameters />
    </>
  );
};

// Component export
export default PageLoader;
