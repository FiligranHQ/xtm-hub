import { FeatureVotingPageLoader } from '@/components/feature-voting/FeatureVotingPageLoader';
import type { PublicLocale } from '@/i18n/config';
import { RelayProvider } from '@/relay/relay-provider';
import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import { buildSeoPageMetadata, getBaseUrl } from '@/utils/generate-metadata';
import {
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
  XTM_PLATFORM_ROADMAP_SLUG,
} from '@/utils/path/constant';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import SeoServiceInstanceQuery, {
  seoServiceInstanceQuery,
} from '@generated/seoServiceInstanceQuery.graphql';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

const ROADMAP_PATH = `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${XTM_PLATFORM_ROADMAP_SLUG}`;

/** The voting round belongs to the roadmap service instance behind that slug. */
const getRoadmapServiceInstance = cache(async () => {
  const serviceResponse = await serverFetchGraphQL<seoServiceInstanceQuery>(
    SeoServiceInstanceQuery,
    { slug: XTM_PLATFORM_ROADMAP_SLUG },
    { cache: undefined, next: { revalidate: 3600 } }
  );
  return serviceResponse.data
    .seoServiceInstance as unknown as seoServiceInstanceFragment$data;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: PublicLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'FeatureVoting' });
  const baseUrl = await getBaseUrl();

  return buildSeoPageMetadata({
    baseUrl,
    locale,
    pathname: `${ROADMAP_PATH}/feature-voting`,
    title: `${t('Title')} | XTM Hub`,
    description: t('MetaDescription'),
    imageAlt: t('Title'),
  });
}

const Page = async ({
  params,
}: {
  params: Promise<{ locale: PublicLocale }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);

  const serviceInstance = await getRoadmapServiceInstance();

  return (
    <RelayProvider>
      <FeatureVotingPageLoader
        serviceInstanceId={serviceInstance.id}
        roadmapHref={`/${locale}${ROADMAP_PATH}`}
      />
    </RelayProvider>
  );
};

export default Page;
