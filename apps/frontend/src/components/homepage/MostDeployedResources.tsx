import HomepageResourceList from '@/components/homepage/HomepageResourceList';
import type { PublicLocale } from '@/i18n/config';
import { portalGraphqlClientCached } from '@/lib/graphql-client';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import {
  PlatformIdentifier,
  useMostDeployedDocumentsQueryQuery,
} from '@graphql/generated';
import { getTranslations } from 'next-intl/server';

const MOST_DEPLOYED_LIMIT = 8;

type MostDeployedResourcesProps = {
  locale: PublicLocale;
  platformIdentifiers?: PlatformIdentifierEnum[];
  isAuthenticated?: boolean;
};

const MostDeployedResources = async ({
  locale,
  platformIdentifiers,
  isAuthenticated = false,
}: MostDeployedResourcesProps) => {
  const t = await getTranslations('HomePage.XtmMostDeployedResources');

  const data = await useMostDeployedDocumentsQueryQuery.fetcher(
    portalGraphqlClientCached,
    {
      limit: MOST_DEPLOYED_LIMIT,
      platformIdentifiers: (platformIdentifiers ?? []) as unknown as PlatformIdentifier[],
    }
  )();

  return (
    <HomepageResourceList
      title={t('Title')}
      locale={locale}
      documents={data.mostDeployedDocuments}
      isAuthenticated={isAuthenticated}
    />
  );
};

export default MostDeployedResources;
