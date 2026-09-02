import HomepageResourceList from '@/components/homepage/resources/HomepageResourceList';
import { PublicLocale } from '@/i18n/config';
import { serverGraphqlFetch } from '@/lib/server-graphql-fetch';
import { PUBLIC_PAGE_REVALIDATE_SECONDS } from '@/utils/constant';
import {
  NewestDocumentsQueryDocument,
  NewestDocumentsQueryQuery,
  NewestDocumentsQueryQueryVariables,
  PlatformIdentifier,
} from '@graphql/generated';
import { getTranslations } from 'next-intl/server';

const NEWEST_LIMIT = 8;

type NewestResourcesProps = {
  platformIdentifiers?: PlatformIdentifier[];
  isAuthenticated?: boolean;
  paramsLocale?: PublicLocale;
};

const NewestResources = async ({
  platformIdentifiers,
  isAuthenticated = false,
  paramsLocale,
}: NewestResourcesProps) => {
  const t = await getTranslations('HomePage.XtmNewestResources');

  const data = await serverGraphqlFetch<
    NewestDocumentsQueryQuery,
    NewestDocumentsQueryQueryVariables
  >(
    NewestDocumentsQueryDocument,
    {
      limit: NEWEST_LIMIT,
      platformIdentifiers: platformIdentifiers ?? [],
    },
    { next: { revalidate: PUBLIC_PAGE_REVALIDATE_SECONDS } }
  );

  return (
    <HomepageResourceList
      title={t('Title')}
      documents={data.newestDocuments}
      isAuthenticated={isAuthenticated}
      paramsLocale={paramsLocale}
    />
  );
};

export default NewestResources;
