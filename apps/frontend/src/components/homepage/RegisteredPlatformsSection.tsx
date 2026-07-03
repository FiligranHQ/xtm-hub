import DeployFirstResourceBlock from '@/components/homepage/DeployFirstResourceBlock';
import {
  mapRegisteredPlatformsToHomepageCards,
  resolveHomepageCrossSellProduct,
} from '@/components/homepage/Homepage.utils';
import RegisteredPlatformCard from '@/components/homepage/RegisteredPlatformCard';
import TryOtherPlatformProductBlock from '@/components/homepage/TryOtherPlatformProductBlock';
import {
  RegisteredPlatformsQuery,
  ServiceDefinitionIdentifier,
} from '@graphql/generated';
import { getTranslations } from 'next-intl/server';

interface RegisteredPlatformsSectionProps {
  welcomeName?: string;
  registeredIdentifiers: ServiceDefinitionIdentifier[];
  registeredPlatformsData: RegisteredPlatformsQuery;
}

export const RegisteredPlatformsSection = async ({
  welcomeName,
  registeredIdentifiers,
  registeredPlatformsData,
}: RegisteredPlatformsSectionProps) => {
  const t = await getTranslations();
  const homepageRegisteredPlatformCards = mapRegisteredPlatformsToHomepageCards(
    registeredPlatformsData.registeredPlatforms
  );

  const crossSellProduct = resolveHomepageCrossSellProduct(
    registeredIdentifiers
  );

  if (!homepageRegisteredPlatformCards.length) {
    return null;
  }

  return (
    <section className="w-3/8 bg-page-background p-l rounded-lg">
      <div className="flex flex-col">
        <span className="text-primary txt-small font-semibold tracking-wide">
          {welcomeName
            ? t('PublicHomePage.XtmPlatform.LabelWithName', {
                name: welcomeName,
              })
            : t('PublicHomePage.XtmPlatform.Label', {})}
        </span>

        {homepageRegisteredPlatformCards.map((platformCard) => (
          <RegisteredPlatformCard
            key={platformCard.id}
            platform={platformCard}
          />
        ))}

        <DeployFirstResourceBlock />

        {crossSellProduct && (
          <TryOtherPlatformProductBlock product={crossSellProduct} />
        )}
      </div>
    </section>
  );
};
