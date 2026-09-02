import { BUNDLE_SCOPE } from '@/components/trials/trials.const';
import TrialsList from '@/components/trials/TrialsList';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { useIsFeatureEnabled } from '@/hooks/use-is-feature-enabled';
import { FeatureFlag } from '@graphql/generated';
import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Settings',
  },
  {
    label: 'MenuLinks.ManageTrials',
  },
];

const PageLoader = () => {
  const t = useTranslations();
  const isXtmPlatformTrialEnabled = useIsFeatureEnabled(
    FeatureFlag.XtmPlatformTrial
  );

  if (!isXtmPlatformTrialEnabled) {
    notFound();
  }

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="sr-only">{t('MenuLinks.ManageTrials')}</h1>
      <TrialsList scope={BUNDLE_SCOPE} />
    </>
  );
};

export default PageLoader;
