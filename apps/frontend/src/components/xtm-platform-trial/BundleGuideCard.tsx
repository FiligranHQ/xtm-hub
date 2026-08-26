'use client';

import { Button } from '@filigran/ui';
import { useTranslations } from 'next-intl';

export const BundleGuideCard = () => {
  const tGuide = useTranslations('XtmPlatformTrial.Guide');

  return (
    <div className="flex w-[417.33px] max-w-full flex-col gap-l rounded-lg bg-elevation-background-layer-3 p-xl">
      <div className="flex flex-col">
        <h2 className="text-header-heading-xl">{tGuide('Title')}</h2>
        <p className="text-content-body-compact text-text-default-primary">
          {tGuide('Content')}
        </p>
      </div>
      <Button variant="secondary" className="self-start">
        {tGuide('SeeMore')}
      </Button>
    </div>
  );
};
