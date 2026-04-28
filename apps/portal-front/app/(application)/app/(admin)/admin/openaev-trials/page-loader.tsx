import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { useTranslations } from 'next-intl';
import TrialsList from '../../../../../../src/components/trials/TrialsList';
import { BreadcrumbNav } from '../../../../../../src/components/ui/BreadcrumbNav';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Settings',
  },
  {
    label: 'MenuLinks.OpenAEVTrials',
  },
];
const PageLoader = () => {
  const t = useTranslations();
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="sr-only">{t('MenuLinks.OpenAEVTrials')}</h1>
      <TrialsList platformIdentifier={PlatformIdentifierEnum.OPENAEV} />
    </>
  );
};

// Component export
export default PageLoader;
