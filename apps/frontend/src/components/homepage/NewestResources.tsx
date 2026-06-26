import HomepageResourceList from '@/components/homepage/HomepageResourceList';
import type { PublicLocale } from '@/i18n/config';
import { portalGraphqlClientCached } from '@/lib/graphql-client';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import {
  PlatformIdentifier,
  useNewestDocumentsQueryQuery,
} from '@graphql/generated';
import { getTranslations } from 'next-intl/server';

const NEWEST_LIMIT = 8;

type NewestResourcesProps = {
  locale: PublicLocale;
  platformIdentifiers?: PlatformIdentifierEnum[];
};

const NewestResources = async ({
  locale,
  platformIdentifiers,
}: NewestResourcesProps) => {
  const t = await getTranslations('HomePage.XtmNewestResources');

  const data = await useNewestDocumentsQueryQuery.fetcher(
    portalGraphqlClientCached,
    {
      limit: NEWEST_LIMIT,
      platformIdentifiers: (platformIdentifiers ?? []) as unknown as PlatformIdentifier[],
    }
  )();

  return (
    <HomepageResourceList
      title={t('Title')}
      locale={locale}
      documents={data.newestDocuments}
    />
  );
};

export default NewestResources;

