import TrialsList from '@/components/trials/TrialsList';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { PlatformIdentifier } from '@graphql/generated';
import { useTranslate } from '@tolgee/react';

const breadcrumbValue = [
  {
    label: 'MenuLinks_Settings',
  },
  {
    label: 'MenuLinks_OpenCTITrial',
  },
];
const PageLoader = () => {
  const { t } = useTranslate();
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="sr-only">{t('MenuLinks_OpenCTITrial')}</h1>
      <TrialsList platformIdentifier={PlatformIdentifier.Opencti} />
    </>
  );
};

// Component export
export default PageLoader;
