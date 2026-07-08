import HomepageResourceList from '@/components/homepage/HomepageResourceList';
import { portalGraphqlClientCached } from '@/lib/graphql-client';
import {
  PlatformIdentifier,
  useMostDeployedDocumentsQueryQuery,
} from '@graphql/generated';
import { getTranslations } from 'next-intl/server';

const MOST_DEPLOYED_LIMIT = 8;

type MostDeployedResourcesProps = {
  platformIdentifiers?: PlatformIdentifier[];
  isAuthenticated?: boolean;
};

const MostDeployedResources = async ({
  platformIdentifiers,
  isAuthenticated = false,
}: MostDeployedResourcesProps) => {
  const t = await getTranslations('HomePage.XtmMostDeployedResources');

  const data = await useMostDeployedDocumentsQueryQuery.fetcher(
    portalGraphqlClientCached,
    {
      limit: MOST_DEPLOYED_LIMIT,
      platformIdentifiers: platformIdentifiers ?? [],
    }
  )();

  return (
    <HomepageResourceList
      title={t('Title')}
      documents={data.mostDeployedDocuments}
      isAuthenticated={isAuthenticated}
    />
  );
};

export default MostDeployedResources;
