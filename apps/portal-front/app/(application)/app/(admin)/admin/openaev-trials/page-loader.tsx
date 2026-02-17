import TrialsList from '@/components/trials/trials-list';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { useTranslations } from 'next-intl';

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
