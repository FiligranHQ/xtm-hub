import HomepageResourceList from '@/components/homepage/HomepageResourceList';
import { portalGraphqlClientCached } from '@/lib/graphql-client';
import {
  PlatformIdentifier,
  useNewestDocumentsQueryQuery,
} from '@graphql/generated';
import { getTranslations } from 'next-intl/server';

const NEWEST_LIMIT = 8;

type NewestResourcesProps = {
  platformIdentifiers?: PlatformIdentifier[];
  isAuthenticated?: boolean;
};

const NewestResources = async ({
  platformIdentifiers,
  isAuthenticated = false,
}: NewestResourcesProps) => {
  const t = await getTranslations('HomePage.XtmNewestResources');

  const data = await useNewestDocumentsQueryQuery.fetcher(
    portalGraphqlClientCached,
    {
      limit: NEWEST_LIMIT,
      platformIdentifiers: platformIdentifiers ?? [],
    }
  )();

  return (
    <HomepageResourceList
      title={t('Title')}
      documents={data.newestDocuments}
      isAuthenticated={isAuthenticated}
    />
  );
};

export default NewestResources;
