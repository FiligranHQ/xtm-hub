import { mapRegisteredPlatformsToHomepageCards } from '@/components/homepage/Homepage.utils';
import RegisteredPlatformCard from '@/components/homepage/registered-platforms/RegisteredPlatformCard';
import TryOtherPlatformProductBlock from '@/components/homepage/registered-platforms/TryOtherPlatformProductBlock';
import { RegisteredPlatformsQuery } from '@graphql/generated';
import { getTranslations } from 'next-intl/server';

interface RegisteredPlatformsSectionProps {
  welcomeName?: string;
  registeredPlatformsData: RegisteredPlatformsQuery;
}

export const RegisteredPlatformsSection = async ({
  welcomeName,
  registeredPlatformsData,
}: RegisteredPlatformsSectionProps) => {
  const t = await getTranslations();
  const homepageRegisteredPlatformCards = mapRegisteredPlatformsToHomepageCards(
    registeredPlatformsData.registeredPlatforms
  );

  const registeredProductsCount = homepageRegisteredPlatformCards.length;
  if (!registeredProductsCount) {
    return null;
  }

  return (
    <section className="w-full lg:w-3/8 bg-elevation-background-layer-1 p-l rounded-lg max-h-96 overflow-scroll small-scroll">
      <div className="flex flex-col">
        <span className="heading-xs text-filigran-brand-primary">
          {welcomeName
            ? t('PublicHomePage.XtmPlatform.LabelWithName', {
                name: welcomeName,
              })
            : t('PublicHomePage.XtmPlatform.Label', {})}
        </span>
        <span className="mt-l mb-s text-content-body-base text-text-default-primary">
          {t('PublicHomePage.XtmPlatform.ConnectedProducts', {
            count: registeredProductsCount,
          })}
        </span>

        {homepageRegisteredPlatformCards.map((platformCard) => (
          <RegisteredPlatformCard
            key={platformCard.id}
            platform={platformCard}
          />
        ))}

        <TryOtherPlatformProductBlock />
      </div>
    </section>
  );
};
