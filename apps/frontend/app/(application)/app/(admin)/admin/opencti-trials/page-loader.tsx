import TrialsList from '@/components/trials/TrialsList';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
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
      <TrialsList platformIdentifier={PlatformIdentifierEnum.OPENCTI} />
    </>
  );
};

// Component export
export default PageLoader;
