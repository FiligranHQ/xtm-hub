import HomepageResourceList from '@/components/homepage/HomepageResourceList';
import { PublicLocale } from '@/i18n/config';
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
  paramsLocale?: PublicLocale;
};

const MostDeployedResources = async ({
  platformIdentifiers,
  isAuthenticated = false,
  paramsLocale,
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
      paramsLocale={paramsLocale}
    />
  );
};

export default MostDeployedResources;
