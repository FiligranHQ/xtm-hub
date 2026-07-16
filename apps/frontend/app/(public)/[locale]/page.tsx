import Homepage from '@/components/homepage/Homepage';
import PublicServiceInstanceCard from '@/components/service/PublicServiceInstanceCard';
import type { PublicLocale } from '@/i18n/config';
import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import {
  buildSeoPageMetadata,
  FILIGRAN_ORGANIZATION_JSONLD,
  getBaseUrl,
  stringifyJsonLd,
} from '@/utils/generate-metadata';
import { seoServiceInstanceToInstanceCardData } from '@/utils/services';
import { isFeatureEnabled } from '@/utils/settings.service';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import SeoServiceInstancesQuery, {
  seoServiceInstancesQuery,
} from '@generated/seoServiceInstancesQuery.graphql';
import { FeatureFlag } from '@graphql/generated';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: PublicLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = await getBaseUrl();
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return buildSeoPageMetadata({
    baseUrl,
    locale,
    pathname: '/',
    title: t('Title'),
    description: t('Description'),
    imageAlt: t('SiteName'),
  });
}

const Page = async ({
  params,
}: {
  params: Promise<{ locale: PublicLocale }>;
}) => {
  const { locale } = await params;
  const showHomepageV2 = await isFeatureEnabled(FeatureFlag.HomePageV2);

  const baseUrl = await getBaseUrl();
  const tMeta = await getTranslations({ locale, namespace: 'Metadata' });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: tMeta('SiteName'),
    description: tMeta('Description'),
    url: baseUrl,
    image: `${baseUrl}/seo_default.png`,
    publisher: FILIGRAN_ORGANIZATION_JSONLD,
  };

  const jsonLdScript = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: stringifyJsonLd(jsonLd) }}
    />
  );

  if (showHomepageV2) {
    return (
      <>
        {jsonLdScript}
        <Homepage paramsLocale={locale} />
      </>
    );
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
      {jsonLdScript}
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
