import HomepageResourceList from '@/components/homepage/resources/HomepageResourceList';
import { PublicLocale } from '@/i18n/config';
import { serverGraphqlFetch } from '@/lib/server-graphql-fetch';
import {
  MostDeployedDocumentsQueryDocument,
  MostDeployedDocumentsQueryQuery,
  MostDeployedDocumentsQueryQueryVariables,
  PlatformIdentifier,
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

  const data = await serverGraphqlFetch<
    MostDeployedDocumentsQueryQuery,
    MostDeployedDocumentsQueryQueryVariables
  >(
    MostDeployedDocumentsQueryDocument,
    {
      limit: MOST_DEPLOYED_LIMIT,
      platformIdentifiers: platformIdentifiers ?? [],
    },
    { next: { revalidate: 3600 } }
  );

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
