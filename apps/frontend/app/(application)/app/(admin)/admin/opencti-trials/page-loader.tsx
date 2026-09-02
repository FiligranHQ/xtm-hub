import TrialsList from '@/components/trials/TrialsList';
import { productScope } from '@/components/trials/trials.const';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { PlatformIdentifier } from '@graphql/generated';
import { useTranslations } from 'next-intl';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Settings',
  },
  {
    label: 'MenuLinks.OpenCTITrial',
  },
];
const PageLoader = () => {
  const t = useTranslations();
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="sr-only">{t('MenuLinks.OpenCTITrial')}</h1>
      <TrialsList scope={productScope(PlatformIdentifier.Opencti)} />
    </>
  );
};

// Component export
export default PageLoader;
