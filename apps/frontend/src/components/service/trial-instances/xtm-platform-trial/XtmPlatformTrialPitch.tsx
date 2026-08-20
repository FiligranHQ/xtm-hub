'use client';

import { PlatformMetadataMapping } from '@/components/registration/PlatformIdentifierMapping';
import { PlatformIdentifier } from '@graphql/generated';
import { useTranslations } from 'next-intl';

const BUNDLE_PRODUCTS = [
  PlatformIdentifier.Opencti,
  PlatformIdentifier.Openaev,
  PlatformIdentifier.Xtmone,
];

const PRODUCT_TRANSLATION_KEYS: Record<PlatformIdentifier, string> = {
  [PlatformIdentifier.Opencti]: 'opencti',
  [PlatformIdentifier.Openaev]: 'openaev',
  [PlatformIdentifier.Xtmone]: 'xtmone',
};

export const XtmPlatformTrialPitch = () => {
  const t = useTranslations('Service.Trials.XtmPlatform.Page');

  return (
    <section className="flex flex-col gap-xl">
      <div className="flex flex-col gap-l">
        <h2 className="heading-xl">{t('PitchTitle')}</h2>
        <p className="content-body-base">{t('PitchDescription')}</p>
      </div>

      {BUNDLE_PRODUCTS.map((platformIdentifier) => {
        const { name, Icon } = PlatformMetadataMapping[platformIdentifier];
        const productKey = PRODUCT_TRANSLATION_KEYS[platformIdentifier];

        return (
          <article
            key={platformIdentifier}
            className="flex flex-col gap-s">
            <div className="flex items-center gap-s">
              <Icon className="size-6" />
              <span className="heading-lg">{name}</span>
            </div>
            <h3 className="font-bold">{t(`Products.${productKey}.Tagline`)}</h3>
            <p className="content-body-base">
              {t(`Products.${productKey}.Description`)}
            </p>
          </article>
        );
      })}
    </section>
  );
};
