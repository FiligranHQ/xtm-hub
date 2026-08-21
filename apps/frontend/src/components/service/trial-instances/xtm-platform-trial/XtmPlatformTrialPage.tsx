import { XtmPlatformTrialLimitations } from '@/components/service/trial-instances/xtm-platform-trial/XtmPlatformTrialLimitations';
import { XtmPlatformTrialPitch } from '@/components/service/trial-instances/xtm-platform-trial/XtmPlatformTrialPitch';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';

interface XtmPlatformTrialPageProps {
  panel: ReactNode;
  showLimitations?: boolean;
}

export const XtmPlatformTrialPage = ({
  panel,
  showLimitations = false,
}: XtmPlatformTrialPageProps) => {
  const t = useTranslations('Service.Trials.XtmPlatform.Page');

  return (
    <div className="flex flex-col gap-xxl">
      <header className="flex flex-col gap-s">
        <p className="heading-sm bg-clip-text text-transparent bg-gradient-focus">
          {t('Overline')}
        </p>
        <h1 className="heading-2xl">{t('Title')}</h1>
      </header>

      <div className="flex flex-col gap-l lg:flex-row lg:items-start">
        <div className="flex flex-1 flex-col gap-xl">
          <XtmPlatformTrialPitch />
          {showLimitations && <XtmPlatformTrialLimitations />}
        </div>
        <div className="flex w-full items-center lg:w-[521px] lg:shrink-0">
          <div className="w-full lg:w-[521px] lg:shrink-0">{panel}</div>
        </div>
      </div>
    </div>
  );
};
