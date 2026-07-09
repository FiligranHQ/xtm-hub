import HomepageResourceList from '@/components/homepage/HomepageResourceList';
import type { PublicLocale } from '@/i18n/config';
import { portalGraphqlClientCached } from '@/lib/graphql-client';
import {
  PlatformIdentifier,
  useNewestDocumentsQueryQuery,
} from '@graphql/generated';
import { getTranslations } from 'next-intl/server';

const NEWEST_LIMIT = 8;

type NewestResourcesProps = {
  locale: PublicLocale;
  platformIdentifiers?: PlatformIdentifier[];
  isAuthenticated?: boolean;
};

const NewestResources = async ({
  locale,
  platformIdentifiers,
  isAuthenticated = false,
}: NewestResourcesProps) => {
  const t = await getTranslations('HomePage.XtmNewestResources');

  const data = await useNewestDocumentsQueryQuery.fetcher(
    portalGraphqlClientCached,
    {
      limit: NEWEST_LIMIT,
      platformIdentifiers: (platformIdentifiers ??
        []) as unknown as PlatformIdentifier[],
    }
  )();

  return (
    <HomepageResourceList
      title={t('Title')}
      locale={locale}
      documents={data.newestDocuments}
      isAuthenticated={isAuthenticated}
    />
  );
};

export default NewestResources;
