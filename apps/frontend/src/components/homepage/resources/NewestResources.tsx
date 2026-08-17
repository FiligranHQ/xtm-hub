import HomepageResourceList from '@/components/homepage/resources/HomepageResourceList';
import { serverGraphqlFetch } from '@/lib/server-graphql-fetch';
import { getTranslate } from '@/tolgee/server';
import {
  NewestDocumentsQueryDocument,
  NewestDocumentsQueryQuery,
  NewestDocumentsQueryQueryVariables,
  PlatformIdentifier,
} from '@graphql/generated';

const NEWEST_LIMIT = 8;

type NewestResourcesProps = {
  platformIdentifiers?: PlatformIdentifier[];
  isAuthenticated?: boolean;
};

const NewestResources = async ({
  platformIdentifiers,
  isAuthenticated = false,
}: NewestResourcesProps) => {
  const t = await getTranslate();

  const data = await serverGraphqlFetch<
    NewestDocumentsQueryQuery,
    NewestDocumentsQueryQueryVariables
  >(
    NewestDocumentsQueryDocument,
    {
      limit: NEWEST_LIMIT,
      platformIdentifiers: platformIdentifiers ?? [],
    },
    { next: { revalidate: 3600 } }
  );

  return (
    <HomepageResourceList
      title={t('HomePage_XtmNewestResources_Title')}
      documents={data.newestDocuments}
      isAuthenticated={isAuthenticated}
    />
  );
};

export default NewestResources;
