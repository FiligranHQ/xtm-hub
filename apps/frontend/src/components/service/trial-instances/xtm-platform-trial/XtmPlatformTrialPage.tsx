import { XtmPlatformTrialLimitations } from '@/components/service/trial-instances/xtm-platform-trial/XtmPlatformTrialLimitations';
import { XtmPlatformTrialPitch } from '@/components/service/trial-instances/xtm-platform-trial/XtmPlatformTrialPitch';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';

interface XtmPlatformTrialPageProps {
  panel: ReactNode;
}

export const XtmPlatformTrialPage = ({ panel }: XtmPlatformTrialPageProps) => {
  const t = useTranslations('Service.Trials.XtmPlatform.Page');

  return (
    <>
      <header className="flex flex-col gap-s px-m pt-m pb-xl">
        <p className="text-filigran-brand-primary font-bold">{t('Overline')}</p>
        <h1 className="heading-2xl">{t('Title')}</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl px-m pb-xxl">
        <div className="flex flex-col gap-xl">
          <XtmPlatformTrialPitch />
          <XtmPlatformTrialLimitations />
        </div>
        <div>{panel}</div>
      </div>
    </>
  );
};
