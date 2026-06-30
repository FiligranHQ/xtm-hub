import Homepage from '@/components/homepage/Homepage';
import PublicServiceInstanceCard from '@/components/service/PublicServiceInstanceCard';
import type { PublicLocale } from '@/i18n/config';
import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import { seoServiceInstanceToInstanceCardData } from '@/utils/services';
import { isFeatureEnabled } from '@/utils/settings.service';
import { FeatureFlagEnum } from '@generated/models/FeatureFlag.enum';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import SeoServiceInstancesQuery, {
  seoServiceInstancesQuery,
} from '@generated/seoServiceInstancesQuery.graphql';
import { getTranslations } from 'next-intl/server';

const Page = async ({
  params,
}: {
  params: Promise<{ locale: PublicLocale }>;
}) => {
  const { locale } = await params;
  const showHomepageV2 = await isFeatureEnabled(FeatureFlagEnum.HOME_PAGE_V2);

  if (showHomepageV2) {
    return <Homepage locale={locale} />;
  }

  const response = await serverFetchGraphQL<seoServiceInstancesQuery>(
    SeoServiceInstancesQuery,
    {},
    { cache: undefined, next: { revalidate: 3600 } }
  );
  const services = response.data
    .seoServiceInstances as unknown as seoServiceInstanceFragment$data[];

  const t = await getTranslations();
  return (
    <>
      <h1 className="leading-tight my-8 md:my-16 text-center text-[2.5rem] md:text-[3.5rem]">
        {t('PublicHomePage.Title')}
      </h1>
      <ul
        className={
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-l'
        }>
        {services.map((service) => (
          <PublicServiceInstanceCard
            key={service.id}
            serviceInstance={seoServiceInstanceToInstanceCardData(service, t)}
          />
        ))}
      </ul>
    </>
  );
};

export default Page;
