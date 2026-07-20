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
    <section className="w-full lg:w-3/8 bg-page-background p-l rounded-lg max-h-96 overflow-scroll">
      <div className="flex flex-col">
        <span className="text-primary txt-small font-semibold tracking-wide">
          {welcomeName
            ? t('PublicHomePage.XtmPlatform.LabelWithName', {
                name: welcomeName,
              })
            : t('PublicHomePage.XtmPlatform.Label', {})}
        </span>
        <span className="mt-l mb-s txt-small">
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
